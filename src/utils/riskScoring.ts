import { GuildMember, Message, TextChannel, Guild, Collection, AuditLogEvent } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import logger from './logger';
import { warnUser } from '../commands/moderation/warn';

const prisma = new PrismaClient();

interface RiskFactors {
  accountAge: number;
  serverAge: number;
  messageActivity: number;
  messageContent: number;
  usernameRisk: number;
  kickHistory: number;
}

interface RiskAssessment {
  score: number;
  factors: string[];
  details: {
    totalMessages: number;
    linkCount: number;
    accountAgeDays: number;
    serverAgeDays: number;
    hasNormalMessages: boolean;
    kickCount: number;
  };
}

const RISK_WEIGHTS: RiskFactors = {
  accountAge: 30,
  serverAge: 20,
  messageActivity: 15,
  messageContent: 15,
  usernameRisk: 5,
  kickHistory: 15,
};

const USERNAME_PATTERNS = {
  // High risk patterns (75+ risk score)
  high: [
    /_\d{4,}$/, // Underscore followed by 4+ digits at end (common bot pattern)
    /\d{4,}_\d{4,}/, // Multiple number groups with underscore
    /^[a-zA-Z]\d{7}$/, // Single letter followed by exactly 7 digits
    /^[a-zA-Z0-9]+(bot|spam)$/i, // Bot or spam in username
    /(nitro|free|giveaway|discord\.gift)/i, // Common scam words
    /\d{5,}$/, // 5+ digits at end of name
    /^[a-z]+\d{5,}/i, // Word followed by 5+ digits
    /^[a-z]+\d{2,}_\d{4,}/i, // Word + numbers + underscore + 4+ digits
  ],
  // Medium risk patterns (50-74 risk score)
  medium: [
    /(.)\1{4,}/, // Same character repeated 5+ times
    /^[a-z0-9]{8,}$/i, // Random letters and numbers
    /^[^a-z]*$/i, // No letters
    /[0-9]+[a-z]+[0-9]+[a-z]+/i, // Alternating numbers and letters
    /^[a-z]{1,3}\d{2,}/i, // Short word (1-3 chars) followed by numbers
    /\d{2,}[a-z]{1,3}\d{2,}/i, // Numbers + short word + numbers
  ],
};

async function checkPriorKicks(member: GuildMember): Promise<number> {
  try {
    const auditLogs = await member.guild.fetchAuditLogs({
      type: AuditLogEvent.MemberKick,
      limit: 100,
    });

    const userKicks = auditLogs.entries.filter((entry) => entry.targetId === member.id);
    logger.debug(`Found ${userKicks.size} prior kicks for user ${member.id}`);
    return userKicks.size;
  } catch (error) {
    logger.error(`Error checking kick history for ${member.id}:`, error);
    return 0;
  }
}

async function fetchRecentMessages(channel: TextChannel, userId: string): Promise<Message[]> {
  const messages: Message[] = [];
  let lastId: string | undefined;

  try {
    logger.debug(`Fetching messages for user ${userId} in channel ${channel.name}`);
    for (let i = 0; i < 5; i++) {
      const options: any = { limit: 100 };
      if (lastId) options.before = lastId;

      const fetchedMessages = (await channel.messages.fetch(options)) as unknown as Collection<string, Message>;
      if (fetchedMessages.size === 0) break;

      const userMessages = fetchedMessages.filter((msg) => msg.author.id === userId);
      messages.push(...userMessages.values());
      lastId = fetchedMessages.last()?.id;

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    logger.debug(`Found ${messages.length} messages for user ${userId} in channel ${channel.name}`);
  } catch (error) {
    logger.error(`Error fetching messages for user ${userId} in channel ${channel.name}:`, error);
  }

  return messages;
}

async function analyzeMessageContent(messages: Message[]): Promise<{
  linkCount: number;
  hasNormalMessages: boolean;
}> {
  let linkCount = 0;
  let hasNormalMessages = false;
  const linkRegex = /https?:\/\/[^\s]+/g;

  for (const message of messages) {
    const links = message.content.match(linkRegex);
    if (links) {
      linkCount += links.length;
    }

    const contentWithoutLinks = message.content.replace(linkRegex, '').trim();
    if (contentWithoutLinks.length > 10) {
      hasNormalMessages = true;
    }
  }

  return { linkCount, hasNormalMessages };
}

function calculateUsernameRiskScore(username: string): { score: number; factors: string[] } {
  const factors: string[] = [];
  let highestScore = 0;

  // Check high risk patterns first
  for (const pattern of USERNAME_PATTERNS.high) {
    if (pattern.test(username)) {
      highestScore = 0.75; // 75% risk score
      factors.push('High risk username pattern detected');
      break;
    }
  }

  // Check medium risk patterns if no high risk patterns found
  if (highestScore === 0) {
    for (const pattern of USERNAME_PATTERNS.medium) {
      if (pattern.test(username)) {
        highestScore = 0.5; // 50% risk score
        factors.push('Suspicious username pattern detected');
        break;
      }
    }
  }

  return { score: highestScore, factors };
}

async function assessUserRisk(member: GuildMember, textChannels: TextChannel[]): Promise<RiskAssessment> {
  logger.debug(`Starting risk assessment for user ${member.user.tag} (${member.id})`);
  const now = Date.now();
  const factors: string[] = [];
  let totalRiskScore = 0;

  // 1. Account Age Assessment
  const accountAgeDays = (now - member.user.createdTimestamp) / (1000 * 60 * 60 * 24);
  let accountAgeRisk = 0;
  if (accountAgeDays < 30) {
    accountAgeRisk = 1 - accountAgeDays / 30;
    factors.push(`New account (${accountAgeDays.toFixed(1)} days old)`);
    logger.debug(`User ${member.id} has new account risk: ${accountAgeRisk}`);
  }
  totalRiskScore += accountAgeRisk * RISK_WEIGHTS.accountAge;

  // 2. Server Age Assessment
  const serverAgeDays = member.joinedTimestamp ? (now - member.joinedTimestamp) / (1000 * 60 * 60 * 24) : 0;
  let serverAgeRisk = 0;
  if (serverAgeDays < 7) {
    serverAgeRisk = 1 - serverAgeDays / 7;
    factors.push(`Recent join (${serverAgeDays.toFixed(1)} days ago)`);
    logger.debug(`User ${member.id} has server age risk: ${serverAgeRisk}`);
  }
  totalRiskScore += serverAgeRisk * RISK_WEIGHTS.serverAge;

  // 3. Message Analysis
  logger.debug(`Starting message analysis for user ${member.id}`);
  let totalMessages: Message[] = [];
  for (const channel of textChannels) {
    const messages = await fetchRecentMessages(channel, member.id);
    totalMessages = totalMessages.concat(messages);
  }

  // Message Activity Risk
  let activityRisk = 1;
  if (totalMessages.length > 0) {
    activityRisk = Math.max(0, 1 - totalMessages.length / 20);
    if (activityRisk > 0.5) {
      factors.push(`Low message activity (${totalMessages.length} messages)`);
    }
    logger.debug(`User ${member.id} has activity risk: ${activityRisk}`);
  } else {
    factors.push('No messages found');
  }
  totalRiskScore += activityRisk * RISK_WEIGHTS.messageActivity;

  // Message Content Risk
  const { linkCount, hasNormalMessages } = await analyzeMessageContent(totalMessages);
  let contentRisk = 0;
  if (linkCount > 0 && !hasNormalMessages) {
    contentRisk = Math.min(1, linkCount / 5);
    factors.push(`Only posts links (${linkCount} links)`);
  } else if (!hasNormalMessages && totalMessages.length > 0) {
    contentRisk = 0.8;
    factors.push('No substantial messages');
  }
  logger.debug(`User ${member.id} has content risk: ${contentRisk}`);
  totalRiskScore += contentRisk * RISK_WEIGHTS.messageContent;

  // 4. Username Risk
  const { score: usernameRisk, factors: usernameFactors } = calculateUsernameRiskScore(member.user.username);
  totalRiskScore += usernameRisk * RISK_WEIGHTS.usernameRisk;
  factors.push(...usernameFactors);
  logger.debug(`User ${member.id} has username risk: ${usernameRisk}`);

  // 5. Kick History Check
  const kickCount = await checkPriorKicks(member);
  if (kickCount > 0) {
    const kickRisk = Math.min(kickCount * 0.2, 1);
    totalRiskScore += kickRisk * RISK_WEIGHTS.kickHistory;
    factors.push(`Previously kicked ${kickCount} time(s)`);
    logger.debug(`User ${member.id} has kick history risk: ${kickRisk}`);
  }

  const finalScore = Math.min(100, totalRiskScore);
  logger.info(`Risk assessment complete for ${member.user.tag} (${member.id}) - Final Score: ${finalScore}`);

  return {
    score: finalScore,
    factors,
    details: {
      totalMessages: totalMessages.length,
      linkCount,
      accountAgeDays,
      serverAgeDays,
      hasNormalMessages,
      kickCount,
    },
  };
}

export async function assessAndWarnHighRiskUser(member: GuildMember, guild: Guild): Promise<void> {
  try {
    logger.debug(`Starting high risk assessment for ${member.user.tag} (${member.id})`);

    let textChannels: TextChannel[];
    try {
      textChannels = guild.channels.cache
        .filter(
          (channel) =>
            channel.type === 0 && channel.viewable && channel.permissionsFor(guild.members.me!)?.has('ViewChannel')
        )
        .map((channel) => channel as TextChannel);
      logger.debug(`Found ${textChannels.length} accessible text channels`);
    } catch (error) {
      logger.error(`Error getting text channels for ${member.id}:`, error);
      return;
    }

    let assessment;
    try {
      assessment = await assessUserRisk(member, textChannels);
      logger.info(`Risk assessment score for ${member.user.tag}: ${assessment.score}`);
    } catch (error) {
      logger.error(`Error during risk assessment for ${member.id}:`, error);
      return;
    }

    try {
      const roundedScore = Math.round(assessment.score);
      logger.debug(`Attempting to update database for ${member.id} with score: ${roundedScore}`);

      await prisma.user.upsert({
        where: {
          id: member.id,
        },
        create: {
          id: member.id,
          riskScore: roundedScore,
          warns: 0,
          timeouts: 0,
          messageCount: 0,
          joinedAt: member.joinedAt || new Date(),
          lastScan: new Date(),
        },
        update: {
          riskScore: roundedScore,
          lastScan: new Date(),
        },
      });

      logger.info(`Successfully updated risk score for ${member.id}`);
    } catch (error) {
      logger.error('Database error:', {
        userId: member.id,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
      });
      return;
    }

    if (assessment.score > 80) {
      try {
        const reason = `Potential High Risk User - Risk Score: ${Math.round(assessment.score)}%\nFactors:\n${assessment.factors.join('\n')}`;

        let botMember;
        try {
          botMember = await guild.members.fetch(guild.client.user!.id);
        } catch (error) {
          logger.error(`Error fetching bot member for ${member.id}:`, error);
          return;
        }

        const warnResult = await warnUser(member, botMember, reason, true);

        if (!warnResult.success) {
          logger.error(`Failed to warn high-risk user ${member.id}: ${warnResult.error}`);
        } else {
          logger.info(
            `Issued warning to high-risk user ${member.user.tag} (${member.id}) with warn ID: ${warnResult.warnId}`
          );
        }
      } catch (error) {
        logger.error(`Failed to warn high-risk user ${member.id}:`, error || 'No error details available');
      }
    } else {
      logger.debug(`User ${member.id} not high risk enough for warning (score: ${assessment.score})`);
    }
  } catch (error) {
    logger.error(`Unexpected error in assessAndWarnHighRiskUser for ${member.id}:`, error);
  }
}

export { assessUserRisk, RiskAssessment, calculateUsernameRiskScore };
