import { Message, EmbedBuilder, TextChannel } from 'discord.js';
import { Channels, Roles } from '../constants';
import { positivePatterns, resourcePatterns } from '../utils/patterns';
import { guidelineResponses, resourceResponses, cooldownResponses } from '../handlers/botResponsesHandler';
import { Bot } from '..';
import Config from '../config';

interface UserCooldownData {
  lastResponseTime: number;
  messageCount: number;
  sentLogMessage: boolean;
}

const userResponseCooldown = new Map<string, UserCooldownData>();
const userCooldownPeriod = 15 * 60 * 1000; // 15 minutes
const globalCooldownPeriod = 10 * 1000; // 10 seconds
let lastGlobalResponseTime = 0;

const channelIdNames = Object.fromEntries(Object.entries(Channels).map(([key, value]) => [value, key]));

const ignoredChannels: string[] = [Channels.BookClub];

const ignoredRoles: string[] = [Roles.Cox, Roles.LegacyOx, Roles.Moderator, Roles.RecognizedMember, Roles.GitHub];

export const onMessageCreate = async (message: Message) => {
  if (message.author.bot || ignoredChannels.includes(message.channelId)) return;

  const member = message.member;
  if (!member || member.roles.cache.some((role) => ignoredRoles.includes(role.id))) return;

  const now = Date.now();
  const userId = message.author.id;
  const lowerCaseMessage = message.content.toLowerCase();

  if (now - lastGlobalResponseTime < globalCooldownPeriod) {
    return;
  }

  const userData = userResponseCooldown.get(userId) || { lastResponseTime: 0, messageCount: 0, sentLogMessage: false };
  userResponseCooldown.set(userId, userData);

  if (userData.sentLogMessage && now - userData.lastResponseTime < userCooldownPeriod) {
    return;
  }

  const isResourceMatch = resourcePatterns.some((pattern) => pattern.test(lowerCaseMessage));
  const isPositiveMatch = positivePatterns.some((pattern) => pattern.test(lowerCaseMessage));

  if (isResourceMatch || isPositiveMatch) {
    if (userData.messageCount < 2) {
      const channelName = channelIdNames[message.channelId] || 'General';
      const responseArray = isResourceMatch ? resourceResponses : guidelineResponses[channelName];
      const randomResponse = responseArray[Math.floor(Math.random() * responseArray.length)];
      await message.reply(randomResponse);
      lastGlobalResponseTime = now;
      userData.messageCount++;
    } else {
      const randomCooldownResponse = cooldownResponses[Math.floor(Math.random() * cooldownResponses.length)];
      await message.reply(randomCooldownResponse);
      userData.lastResponseTime = now;
      userData.messageCount = 0;
      userData.sentLogMessage = true;
      sendCooldownLog(message, userData.lastResponseTime);
    }
  }
};

async function sendCooldownLog(message: Message, lastResponseTime: number) {
  const remainingTime = userCooldownPeriod - (Date.now() - lastResponseTime);
  const minutes = Math.floor(remainingTime / 60000);
  const seconds = ((remainingTime % 60000) / 1000).toFixed(0);

  const embed = new EmbedBuilder()
    .setColor('#dc2626')
    .setTitle(`${message.author.tag} is currently being ignored by OxBot`)
    .setDescription(`Ignored for ${minutes} minutes, ${seconds} seconds`)
    .setTimestamp()
    .setFooter({ text: `User ID: ${message.author.id}` });

  const logChannel = Bot.channels.cache.get(Config.ACTION_LOG_CHANNEL) as TextChannel;

  if (logChannel) {
    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      // Error handling here when I need it
    }
  }
}
