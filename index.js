const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } = require('discord.js');
const VexenDatabase = require('./database');
const config = require('./config');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences
  ]
});

const db = new VexenDatabase();

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.application.commands.set([
    // Moderation commands
    {
      name: 'warn',
      description: 'Warn a user',
      options: [
        { type: 6, name: 'user', description: 'The user to warn', required: true },
        { type: 3, name: 'reason', description: 'Reason for the warning', required: false }
      ]
    },
    {
      name: 'checkwarns',
      description: 'Check warnings for a user',
      options: [
        { type: 6, name: 'user', description: 'The user to check (optional)', required: false }
      ]
    },
    {
      name: 'removewarn',
      description: 'Remove a specific warning',
      options: [
        { type: 4, name: 'warnid', description: 'The warning ID to remove', required: true }
      ]
    },
    {
      name: 'ban',
      description: 'Ban a user',
      options: [
        { type: 6, name: 'user', description: 'The user to ban', required: true },
        { type: 3, name: 'reason', description: 'Reason for the ban', required: false }
      ]
    },
    {
      name: 'unban',
      description: 'Unban a user by their User ID',
      options: [
        { type: 3, name: 'userid', description: 'The User ID to unban', required: true },
        { type: 3, name: 'reason', description: 'Reason for the unban', required: false }
      ]
    },
    {
      name: 'timeout',
      description: 'Timeout a user',
      options: [
        { type: 6, name: 'user', description: 'The user to timeout', required: true },
        { type: 3, name: 'duration', description: 'Duration in minutes', required: true },
        { type: 3, name: 'reason', description: 'Reason for the timeout', required: false }
      ]
    },
    // Leveling command
    {
      name: 'level',
      description: 'Check your level or another user\'s level',
      options: [
        { type: 6, name: 'user', description: 'The user to check (optional)', required: false }
      ]
    },
    // New Quantum Harmony System - Unique system where users build harmony through positive interactions
    {
      name: 'harmonize',
      description: 'Send harmony to a user, building positive energy',
      options: [
        { type: 6, name: 'user', description: 'The user to harmonize with', required: true },
        { type: 3, name: 'message', description: 'Optional harmony message', required: false }
      ]
    },
    {
      name: 'harmony',
      description: 'Check your harmony level or another user\'s',
      options: [
        { type: 6, name: 'user', description: 'The user to check (optional)', required: false }
      ]
    },
    // Setup commands
    {
      name: 'setlogchannel',
      description: 'Set the log channel for events',
      options: [
        { type: 7, name: 'channel', description: 'The channel to set as log channel', required: true }
      ]
    },
    {
      name: 'setwarnchannel',
      description: 'Set the warn channel',
      options: [
        { type: 7, name: 'channel', description: 'The channel to set as warn channel', required: true }
      ]
    },
    {
      name: 'setbanchannel',
      description: 'Set the ban channel',
      options: [
        { type: 7, name: 'channel', description: 'The channel to set as ban channel', required: true }
      ]
    },
    {
      name: 'settimeoutchannel',
      description: 'Set the timeout channel',
      options: [
        { type: 7, name: 'channel', description: 'The channel to set as timeout channel', required: true }
      ]
    },
    {
      name: 'setlevelchannel',
      description: 'Set the level channel',
      options: [
        { type: 7, name: 'channel', description: 'The channel to set as level channel', required: true }
      ]
    },
    {
      name: 'setharmonychannel',
      description: 'Set the harmony channel',
      options: [
        { type: 7, name: 'channel', description: 'The channel to set as harmony channel', required: true }
      ]
    },
    // Server management commands (Bot Owner only)
    {
      name: 'addserver',
      description: 'Add a server to the allowed list (Bot Owner only)',
      options: [
        { type: 3, name: 'serverid', description: 'The server ID to add', required: true }
      ]
    },
    {
      name: 'removeserver',
      description: 'Remove a server from the allowed list (Bot Owner only)',
      options: [
        { type: 3, name: 'serverid', description: 'The server ID to remove', required: true }
      ]
    },
    {
      name: 'serverlist',
      description: 'List all allowed servers (Bot Owner only)',
      options: []
    },
    {
      name: 'addleader',
      description: 'Add a leader for a server (Bot Owner only)',
      options: [
        { type: 6, name: 'user', description: 'The user to add as leader', required: true },
        { type: 3, name: 'serverid', description: 'The server ID to add the leader to', required: true }
      ]
    },
});

client.on('guildMemberAdd', async (member) => {
  db.addUser(member.id, new Date().toISOString());
  const guildData = db.getGuild(member.guild.id);
  if (guildData && guildData.log_channel_id) {
    const logChannel = member.guild.channels.cache.get(guildData.log_channel_id);
    if (logChannel) {
      const embed = new EmbedBuilder()
        .setTitle('Member Joined')
        .setColor(0x00ff00)
        .addFields(
          { name: 'User', value: member.toString(), inline: true },
          { name: 'Joined At', value: member.joinedAt.toLocaleString(), inline: true }
        );
      await logChannel.send({ embeds: [embed] });
    }
  }
});

client.on('guildMemberRemove', async (member) => {
  const guildData = db.getGuild(member.guild.id);
  if (guildData && guildData.log_channel_id) {
    const logChannel = member.guild.channels.cache.get(guildData.log_channel_id);
    if (logChannel) {
      const userData = db.getUser(member.id);
      let duration = 'Unknown';
      if (userData && userData.join_date) {
        const joinDate = new Date(userData.join_date);
        duration = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24)) + ' days';
      }

      const roles = member.roles.cache.filter(role => role.name !== '@everyone').map(role => role.name);
      const embed = new EmbedBuilder()
        .setTitle('Member Left')
        .setColor(0xff0000)
        .addFields(
          { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
          { name: 'Duration', value: duration, inline: true },
          { name: 'Roles', value: roles.length > 0 ? roles.join(', ') : 'None', inline: false }
        );
      await logChannel.send({ embeds: [embed] });
    }
  }
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  if (!oldMember.premiumSince && newMember.premiumSince) {
    const guildData = db.getGuild(newMember.guild.id);
    if (guildData && guildData.log_channel_id) {
      const logChannel = newMember.guild.channels.cache.get(guildData.log_channel_id);
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setTitle('Member Boosted')
          .setColor(0xffa500)
          .addFields(
            { name: 'User', value: newMember.toString(), inline: true },
            { name: 'Boosted At', value: newMember.premiumSince.toLocaleString(), inline: true }
          );
        await logChannel.send({ embeds: [embed] });
      }
    }
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Leveling system
  const xpGain = config.defaultXpPerMessage;
  await db.updateUserXp(message.author.id, xpGain);

  const userData = await db.getUser(message.author.id);
  const guildData = await db.getGuild(message.guild.id);
  if (userData) {
    const requiredXp = Math.floor(userData.level * config.defaultLevelUpMultiplier * 100);
    if (userData.xp >= requiredXp) {
      const newLevel = userData.level + 1;
      await db.updateUserLevel(message.author.id, newLevel);

      if (guildData && guildData.level_channel_id) {
        const levelChannel = message.guild.channels.cache.get(guildData.level_channel_id);
        if (levelChannel) {
          const embed = new EmbedBuilder()
            .setTitle('Level Up!')
            .setColor(0x00ff00)
            .setDescription(`${message.author} leveled up to level ${newLevel}!`);
          await levelChannel.send({ embeds: [embed] });
        }
      }
    }
  }

  // Quantum Harmony System: Auto-harmonize on positive messages
  const positiveWords = ['thank', 'good', 'great', 'awesome', 'love', 'happy', 'nice', 'cool', 'amazing', 'excellent'];
  const messageContent = message.content.toLowerCase();
  if (positiveWords.some(word => messageContent.includes(word))) {
    // Randomly harmonize nearby users
    const members = message.guild.members.cache.filter(m => !m.user.bot && m.id !== message.author.id);
    if (members.size > 0) {
      const randomMember = members.random();
      await db.addHarmony(randomMember.id, 1, message.author.id);
      // Optional: Send a subtle harmony notification
      const harmonyChannel = message.guild.channels.cache.get(guildData?.harmony_channel_id);
      if (harmonyChannel) {
        const embed = new EmbedBuilder()
          .setTitle('🌟 Quantum Harmony Detected!')
          .setColor(0xff69b4)
          .setDescription(`${message.author} shared positive energy, harmonizing ${randomMember}!`)
          .setFooter({ text: 'Quantum Harmony: Connecting souls through positivity' });
        await harmonyChannel.send({ embeds: [embed] });
      }
    }
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  // Blacklist system removed

  const { commandName, options } = interaction;

  // Channel checks
  const checkChannel = (channelType) => {
    const guildData = db.getGuild(interaction.guild.id);
    if (!guildData) {
      return { valid: false, message: 'Guild not set up. Please use /setlogchannel first.' };
    }
    const channelId = guildData[`${channelType}_channel_id`];
    if (channelId !== interaction.channel.id) {
      return { valid: false, message: `This command can only be used in the designated ${channelType} channel.` };
    }
    return { valid: true };
  };

  try {
    switch (commandName) {
      case 'warn':
        const warnCheck = checkChannel('warn');
        if (!warnCheck.valid) {
          return await interaction.reply({ content: warnCheck.message, ephemeral: true });
        }
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const warnUser = options.getUser('user');
        const warnReason = options.getString('reason') || 'No reason provided';
        db.addWarn(warnUser.id);
        const warns = db.getWarns(warnUser.id);
        const warnEmbed = new EmbedBuilder()
          .setTitle('User Warned')
          .setColor(0xffff00)
          .addFields(
            { name: 'User', value: warnUser.toString(), inline: true },
            { name: 'Warned By', value: interaction.user.toString(), inline: true },
            { name: 'Reason', value: warnReason, inline: true },
            { name: 'Total Warns', value: warns.toString(), inline: true }
          );
        await interaction.reply({ embeds: [warnEmbed] });
        if (warns >= config.defaultWarnLimit) {
          await interaction.guild.members.ban(warnUser, { reason: `Auto-ban: ${warns} warnings` });
          const banEmbed = new EmbedBuilder()
            .setTitle('User Auto-Banned')
            .setColor(0xff0000)
            .addFields(
              { name: 'User', value: warnUser.toString(), inline: true },
              { name: 'Reason', value: `Reached ${warns} warnings`, inline: true }
            );
          await interaction.followup({ embeds: [banEmbed] });
        }
        break;

      case 'ban':
        const banCheck = checkChannel('ban');
        if (!banCheck.valid) {
          return await interaction.reply({ content: banCheck.message, ephemeral: true });
        }
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const banUser = options.getUser('user');
        const banReason = options.getString('reason') || 'No reason provided';
        await interaction.guild.members.ban(banUser, { reason: banReason });
        const banEmbed = new EmbedBuilder()
          .setTitle('User Banned')
          .setColor(0xff0000)
          .addFields(
            { name: 'User', value: banUser.toString(), inline: true },
            { name: 'Banned By', value: interaction.user.toString(), inline: true },
            { name: 'Reason', value: banReason, inline: true }
          );
        await interaction.reply({ embeds: [banEmbed] });
        break;

      case 'blacklist':
        const blacklistCheck = checkChannel('blacklist');
        if (!blacklistCheck.valid) {
          return await interaction.reply({ content: blacklistCheck.message, ephemeral: true });
        }
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const blacklistUser = options.getUser('user');
        db.blacklistUser(blacklistUser.id);
        const blacklistEmbed = new EmbedBuilder()
          .setTitle('User Blacklisted')
          .setColor(0x000000)
          .addFields(
            { name: 'User', value: blacklistUser.toString(), inline: true },
            { name: 'Blacklisted By', value: interaction.user.toString(), inline: true }
          );
        await interaction.reply({ embeds: [blacklistEmbed] });
        break;

      case 'unblacklist':
        const unblacklistCheck = checkChannel('blacklist');
        if (!unblacklistCheck.valid) {
          return await interaction.reply({ content: unblacklistCheck.message, ephemeral: true });
        }
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const unblacklistUser = options.getUser('user');
        db.unblacklistUser(unblacklistUser.id);
        const unblacklistEmbed = new EmbedBuilder()
          .setTitle('User Unblacklisted')
          .setColor(0x00ff00)
          .addFields(
            { name: 'User', value: unblacklistUser.toString(), inline: true },
            { name: 'Unblacklisted By', value: interaction.user.toString(), inline: true }
          );
        await interaction.reply({ embeds: [unblacklistEmbed] });
        break;

      case 'timeout':
        const timeoutCheck = checkChannel('timeout');
        if (!timeoutCheck.valid) {
          return await interaction.reply({ content: timeoutCheck.message, ephemeral: true });
        }
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const timeoutUser = options.getMember('user');
        const timeoutDuration = options.getString('duration');
        const timeoutReason = options.getString('reason') || 'No reason provided';
        const timeoutMs = parseInt(timeoutDuration) * 60 * 1000;
        await timeoutUser.timeout(timeoutMs, timeoutReason);
        const timeoutEmbed = new EmbedBuilder()
          .setTitle('User Timed Out')
          .setColor(0xffa500)
          .addFields(
            { name: 'User', value: timeoutUser.toString(), inline: true },
            { name: 'Timed Out By', value: interaction.user.toString(), inline: true },
            { name: 'Duration', value: `${timeoutDuration} minutes`, inline: true },
            { name: 'Reason', value: timeoutReason, inline: true }
          );
        await interaction.reply({ embeds: [timeoutEmbed] });
        break;

      case 'level':
        const levelCheck = checkChannel('level');
        if (!levelCheck.valid) {
          return await interaction.reply({ content: levelCheck.message, ephemeral: true });
        }
        const levelUser = options.getUser('user') || interaction.user;
        const levelData = db.getUser(levelUser.id);
        if (!levelData) {
          return await interaction.reply({ content: 'User not found in database.', ephemeral: true });
        }
        const levelEmbed = new EmbedBuilder()
          .setTitle(`${levelUser.username}'s Level`)
          .setColor(0x00ff00)
          .addFields(
            { name: 'Level', value: levelData.level.toString(), inline: true },
            { name: 'XP', value: `${levelData.xp}/${Math.floor(levelData.level * config.defaultLevelUpMultiplier * 100)}`, inline: true }
          );
        await interaction.reply({ embeds: [levelEmbed] });
        break;

      case 'setlogchannel':
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const logChannel = options.getChannel('channel');
        db.addGuild(interaction.guild.id);
        db.setGuildChannel(interaction.guild.id, 'log', logChannel.id);
        const logEmbed = new EmbedBuilder()
          .setTitle('Log Channel Set')
          .setColor(0x00ff00)
          .addFields({ name: 'Channel', value: logChannel.toString(), inline: true });
        await interaction.reply({ embeds: [logEmbed] });
        break;

      case 'setwarnchannel':
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const warnChannel = options.getChannel('channel');
        db.addGuild(interaction.guild.id);
        db.setGuildChannel(interaction.guild.id, 'warn', warnChannel.id);
        const warnSetEmbed = new EmbedBuilder()
          .setTitle('Warn Channel Set')
          .setColor(0x00ff00)
          .addFields({ name: 'Channel', value: warnChannel.toString(), inline: true });
        await interaction.reply({ embeds: [warnSetEmbed] });
        break;

      case 'setbanchannel':
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const banChannel = options.getChannel('channel');
        db.addGuild(interaction.guild.id);
        db.setGuildChannel(interaction.guild.id, 'ban', banChannel.id);
        const banSetEmbed = new EmbedBuilder()
          .setTitle('Ban Channel Set')
          .setColor(0x00ff00)
          .addFields({ name: 'Channel', value: banChannel.toString(), inline: true });
        await interaction.reply({ embeds: [banSetEmbed] });
        break;

      case 'settimeoutchannel':
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const timeoutChannel = options.getChannel('channel');
        db.addGuild(interaction.guild.id);
        db.setGuildChannel(interaction.guild.id, 'timeout', timeoutChannel.id);
        const timeoutSetEmbed = new EmbedBuilder()
          .setTitle('Timeout Channel Set')
          .setColor(0x00ff00)
          .addFields({ name: 'Channel', value: timeoutChannel.toString(), inline: true });
        await interaction.reply({ embeds: [timeoutSetEmbed] });
        break;

      case 'setlevelchannel':
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const levelChannel = options.getChannel('channel');
        db.addGuild(interaction.guild.id);
        db.setGuildChannel(interaction.guild.id, 'level', levelChannel.id);
        const levelSetEmbed = new EmbedBuilder()
          .setTitle('Level Channel Set')
          .setColor(0x00ff00)
          .addFields({ name: 'Channel', value: levelChannel.toString(), inline: true });
        await interaction.reply({ embeds: [levelSetEmbed] });
        break;

      case 'harmonize':
        const harmonyCheck = checkChannel('harmony');
        if (!harmonyCheck.valid) {
          return await interaction.reply({ content: harmonyCheck.message, ephemeral: true });
        }
        const harmonizeUser = options.getUser('user');
        const harmonyMessage = options.getString('message') || 'Sending positive harmony!';
        if (harmonizeUser.id === interaction.user.id) {
          return await interaction.reply({ content: 'You cannot harmonize yourself!', ephemeral: true });
        }
        db.addHarmony(harmonizeUser.id, 1, interaction.user.id);
        const harmonyEmbed = new EmbedBuilder()
          .setTitle('🌟 Harmony Sent!')
          .setColor(0xff69b4)
          .setDescription(`${interaction.user} sent harmony to ${harmonizeUser}!`)
          .addFields(
            { name: 'Message', value: harmonyMessage, inline: false },
            { name: 'Quantum Entanglement', value: 'Positive energy shared through quantum harmony!', inline: false }
          );
        await interaction.reply({ embeds: [harmonyEmbed] });
        break;

      case 'harmony':
        const harmonyLevelCheck = checkChannel('harmony');
        if (!harmonyLevelCheck.valid) {
          return await interaction.reply({ content: harmonyLevelCheck.message, ephemeral: true });
        }
        const harmonyUser = options.getUser('user') || interaction.user;
        const harmonyData = await db.getHarmony(harmonyUser.id);
        const lastHarmonized = harmonyData.last_harmonized ? new Date(harmonyData.last_harmonized).toLocaleString() : 'Never';
        const harmonyLevelEmbed = new EmbedBuilder()
          .setTitle(`${harmonyUser.username}'s Quantum Harmony`)
          .setColor(0xff69b4)
          .addFields(
            { name: 'Harmony Points', value: harmonyData.harmony_points.toString(), inline: true },
            { name: 'Last Harmonized', value: lastHarmonized, inline: true }
          )
          .setDescription('Quantum Harmony: Building positive connections through shared energy!');
        await interaction.reply({ embeds: [harmonyLevelEmbed] });
        break;

      case 'setharmonychannel':
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const harmonyChannel = options.getChannel('channel');
        db.addGuild(interaction.guild.id);
        db.setGuildChannel(interaction.guild.id, 'harmony', harmonyChannel.id);
        const harmonySetEmbed = new EmbedBuilder()
          .setTitle('Harmony Channel Set')
          .setColor(0xff69b4)
          .addFields({ name: 'Channel', value: harmonyChannel.toString(), inline: true });
        await interaction.reply({ embeds: [harmonySetEmbed] });
        break;

      case 'checkwarns':
        const checkWarnsCheck = checkChannel('warn');
        if (!checkWarnsCheck.valid) {
          return await interaction.reply({ content: checkWarnsCheck.message, ephemeral: true });
        }
        const checkWarnsUser = options.getUser('user') || interaction.user;
        const warnsData = await db.getWarns(checkWarnsUser.id);
        const warnsEmbed = new EmbedBuilder()
          .setTitle(`${checkWarnsUser.username}'s Warnings`)
          .setColor(0xffff00)
          .setDescription(warnsData.length > 0 ? warnsData.map(w => `ID: ${w.id} | Reason: ${w.reason} | By: <@${w.warned_by}> | Date: ${new Date(w.timestamp).toLocaleString()}`).join('\n') : 'No warnings found.');
        await interaction.reply({ embeds: [warnsEmbed] });
        break;

      case 'removewarn':
        const removeWarnCheck = checkChannel('warn');
        if (!removeWarnCheck.valid) {
          return await interaction.reply({ content: removeWarnCheck.message, ephemeral: true });
        }
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const warnId = options.getInteger('warnid');
        await db.removeWarn(warnId);
        const removeWarnEmbed = new EmbedBuilder()
          .setTitle('Warning Removed')
          .setColor(0x00ff00)
          .addFields({ name: 'Warning ID', value: warnId.toString(), inline: true });
        await interaction.reply({ embeds: [removeWarnEmbed] });
        break;

      case 'addserver':
        if (interaction.user.id !== config.ownerId) {
          return await interaction.reply({ content: 'This command is restricted to the bot owner.', ephemeral: true });
        }
        const serverIdToAdd = options.getString('serverid');
        await db.addAllowedServer(serverIdToAdd);
        const addServerEmbed = new EmbedBuilder()
          .setTitle('Server Added')
          .setColor(0x00ff00)
          .addFields({ name: 'Server ID', value: serverIdToAdd, inline: true });
        await interaction.reply({ embeds: [addServerEmbed] });
        break;

      case 'removeserver':
        if (interaction.user.id !== config.ownerId) {
          return await interaction.reply({ content: 'This command is restricted to the bot owner.', ephemeral: true });
        }
        const serverIdToRemove = options.getString('serverid');
        await db.removeAllowedServer(serverIdToRemove);
        const removeServerEmbed = new EmbedBuilder()
          .setTitle('Server Removed')
          .setColor(0xff0000)
          .addFields({ name: 'Server ID', value: serverIdToRemove, inline: true });
        await interaction.reply({ embeds: [removeServerEmbed] });
        break;

      case 'serverlist':
        if (interaction.user.id !== config.ownerId) {
          return await interaction.reply({ content: 'This command is restricted to the bot owner.', ephemeral: true });
        }
        const allowedServers = await db.getAllowedServers();
        const serverListEmbed = new EmbedBuilder()
          .setTitle('Allowed Servers')
          .setColor(0x00ff00)
          .setDescription(allowedServers.length > 0 ? allowedServers.map(s => s.id).join('\n') : 'No servers allowed.');
        await interaction.reply({ embeds: [serverListEmbed] });
        break;

      case 'addleader':
        if (interaction.user.id !== config.ownerId) {
          return await interaction.reply({ content: 'This command is restricted to the bot owner.', ephemeral: true });
        }
        const leaderUser = options.getUser('user');
        const leaderServerId = options.getString('serverid');
        await db.addLeader(leaderUser.id, leaderServerId);
        const addLeaderEmbed = new EmbedBuilder()
          .setTitle('Leader Added')
          .setColor(0x00ff00)
          .addFields(
            { name: 'User', value: leaderUser.toString(), inline: true },
            { name: 'Server ID', value: leaderServerId, inline: true }
          );
        await interaction.reply({ embeds: [addLeaderEmbed] });
        break;

      default:
        await interaction.reply({ content: 'Unknown command.', ephemeral: true });
        break;
    }
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'An error occurred while executing this command.', ephemeral: true });
  }
});

app.listen(port, () => {
  console.log(`Web server running on port ${port}`);
});

process.on('SIGINT', () => {
  db.close();
  client.destroy();
  process.exit(0);
});

client.login(config.token);
