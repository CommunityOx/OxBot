import Config from './config';
import { Client, GatewayIntentBits, Events, AuditLogEvent } from 'discord.js';
import { onInteraction } from './events/onInteraction';
import { onReady } from './events/onReady';
import { onMemberBan } from './events/onMemberBan';
import { onMemberUnban } from './events/onMemberUnban';
import { onMemberRemove } from './events/onMemberKick';
import { onMessageDelete } from './events/onMessageDelete';
import { onMessageCreate } from './events/onMessageCreate';
import { onMemberJoin } from './events/onMemberJoin';
import { onMemberUpdate } from './events/onMemberUpdate';
import { onMessageDeleteBulk } from './events/onPurge';
import { onSlashCommand } from './events/onSlashCommand';
import { onMemberRoleUpdate } from './events/onMemberRoleUpdate';

export const Bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

Bot.once('ready', async () => await onReady(Bot));

Bot.on(Events.GuildAuditLogEntryCreate, async (auditLogEntry, guild) => {
  switch (auditLogEntry.action) {
    case AuditLogEvent.MemberBanAdd:
      await onMemberBan(auditLogEntry, guild);
      break;
    case AuditLogEvent.MemberBanRemove:
      await onMemberUnban(auditLogEntry, guild);
      break;
    case AuditLogEvent.MemberKick:
      await onMemberRemove(auditLogEntry, guild);
      break;
    case AuditLogEvent.MemberRoleUpdate:
      await onMemberRoleUpdate(auditLogEntry, guild);
      break;
    default:
      break;
  }
});

Bot.on('guildMemberAdd', async (member) => await onMemberJoin(member));
Bot.on('guildMemberUpdate', async (oldMember, newMember) => await onMemberUpdate(oldMember, newMember));
Bot.on('messageDelete', async (message) => await onMessageDelete(message));
Bot.on('messageCreate', async (message) => await onMessageCreate(message));
Bot.on('messageDeleteBulk', onMessageDeleteBulk);
Bot.on('interactionCreate', async (interaction) => {
  await onInteraction(interaction);
  await onSlashCommand(interaction);
});

Bot.login(Config.DISCORD_TOKEN);
