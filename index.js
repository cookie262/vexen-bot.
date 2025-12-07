const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const VexenDatabase = require('./database');
const config = require('./config');
const { basicAI, creativeAI, technicalAI } = require('./ai');
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
  console.log(`Bot Owner ID: ${config.ownerId}`);
  client.application.commands.set([
    // MODERATION COMMANDS
    {
      name: 'kick',
      description: 'Kick a user from the server',
      options: [
        { type: 6, name: 'user', description: 'The user to kick', required: true },
        { type: 3, name: 'reason', description: 'Reason for the kick', required: false }
      ]
    },
    {
      name: 'ban',
      description: 'Ban a user from the server',
      options: [
        { type: 6, name: 'user', description: 'The user to ban', required: true },
        { type: 3, name: 'reason', description: 'Reason for the ban', required: false },
        { type: 4, name: 'delete_messages', description: 'Days of messages to delete (0-7)', required: false }
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
      name: 'warn',
      description: 'Store a warning for a user',
      options: [
        { type: 6, name: 'user', description: 'The user to warn', required: true },
        { type: 3, name: 'reason', description: 'Reason for the warning', required: true }
      ]
    },
    {
      name: 'warnings',
      description: 'Show all warnings of a user',
      options: [
        { type: 6, name: 'user', description: 'The user to check (optional)', required: false }
      ]
    },
    {
      name: 'clearwarnings',
      description: 'Delete all warnings for a user',
      options: [
        { type: 6, name: 'user', description: 'The user to clear warnings for', required: true }
      ]
    },
    {
      name: 'purge',
      description: 'Delete 1–100 messages in a channel',
      options: [
        { type: 4, name: 'amount', description: 'Number of messages to delete (1-100)', required: true }
      ]
    },
    {
      name: 'slowmode',
      description: 'Set slowmode in current channel',
      options: [
        { type: 4, name: 'seconds', description: 'Slowmode delay in seconds (0 to disable)', required: true }
      ]
    },
    {
      name: 'lock',
      description: 'Lock a channel by blocking @everyone from sending messages',
      options: [
        { type: 7, name: 'channel', description: 'The channel to lock (optional)', required: false }
      ]
    },
    {
      name: 'unlock',
      description: 'Unlock a locked channel',
      options: [
        { type: 7, name: 'channel', description: 'The channel to unlock (optional)', required: false }
      ]
    },
    {
      name: 'nickname',
      description: 'Force-change or reset a user\'s nickname',
      options: [
        { type: 6, name: 'user', description: 'The user to change nickname for', required: true },
        { type: 3, name: 'nickname', description: 'The new nickname (leave empty to reset)', required: false }
      ]
    },
    {
      name: 'addrole',
      description: 'Give any role to a user (permission-safe)',
      options: [
        { type: 6, name: 'user', description: 'The user to add role to', required: true },
        { type: 8, name: 'role', description: 'The role to add', required: true }
      ]
    },
    {
      name: 'removerole',
      description: 'Remove a role from a user (permission-safe)',
      options: [
        { type: 6, name: 'user', description: 'The user to remove role from', required: true },
        { type: 8, name: 'role', description: 'The role to remove', required: true }
      ]
    },
    {
      name: 'modlog',
      description: 'Show detailed moderation logs of a user',
      options: [
        { type: 6, name: 'user', description: 'The user to view logs for', required: true },
        { type: 4, name: 'limit', description: 'Number of entries to show (1-50)', required: false }
      ]
    },
    // AI COMMANDS
    {
      name: 'respond',
      description: 'Staff-only AI answer command',
      options: [
        { type: 3, name: 'prompt', description: 'The prompt for AI response', required: true },
        { type: 3, name: 'ai_type', description: 'Type of AI to use', required: true, choices: [
          { name: 'Basic', value: 'basic' },
          { name: 'Creative', value: 'creative' },
          { name: 'Technical', value: 'technical' }
        ]}
      ]
    },
    {
      name: 'say',
      description: 'Staff-only force bot to say message',
      options: [
        { type: 3, name: 'text', description: 'The message for the bot to say', required: true }
      ]
    },
    {
      name: 'aisetpersona',
      description: 'Change AI personality preset',
      options: [
        { type: 3, name: 'style', description: 'AI personality style', required: true, choices: [
          { name: 'Helpful', value: 'helpful' },
          { name: 'Creative', value: 'creative' },
          { name: 'Professional', value: 'professional' },
          { name: 'Witty', value: 'witty' }
        ]}
      ]
    },
    {
      name: 'aichannel',
      description: 'Set the channel where AI is allowed',
      options: [
        { type: 7, name: 'channel', description: 'The channel for AI commands', required: true }
      ]
    },
    {
      name: 'aiexplain',
      description: 'AI explains a topic simply',
      options: [
        { type: 3, name: 'topic', description: 'The topic to explain', required: true },
        { type: 3, name: 'ai_type', description: 'Type of AI to use', required: true, choices: [
          { name: 'Basic', value: 'basic' },
          { name: 'Creative', value: 'creative' },
          { name: 'Technical', value: 'technical' }
        ]}
      ]
    },
    {
      name: 'aigenerate',
      description: 'AI generates ideas',
      options: [
        { type: 3, name: 'subject', description: 'The subject for idea generation', required: true },
        { type: 3, name: 'style', description: 'Generation style', required: true, choices: [
          { name: 'Creative', value: 'creative' },
          { name: 'Practical', value: 'practical' },
          { name: 'Innovative', value: 'innovative' }
        ]},
        { type: 3, name: 'ai_type', description: 'Type of AI to use', required: true, choices: [
          { name: 'Basic', value: 'basic' },
          { name: 'Creative', value: 'creative' },
          { name: 'Technical', value: 'technical' }
        ]}
      ]
    },
    {
      name: 'aistory',
      description: 'AI writes a short story',
      options: [
        { type: 3, name: 'length', description: 'Story length', required: true, choices: [
          { name: 'Short', value: 'short' },
          { name: 'Medium', value: 'medium' },
          { name: 'Long', value: 'long' }
        ]},
        { type: 3, name: 'ai_type', description: 'Type of AI to use', required: true, choices: [
          { name: 'Basic', value: 'basic' },
          { name: 'Creative', value: 'creative' },
          { name: 'Technical', value: 'technical' }
        ]},
        { type: 3, name: 'theme', description: 'Story theme (optional)', required: false }
      ]
    },
    {
      name: 'aidevnotes',
      description: 'AI creates developer update notes',
      options: [
        { type: 3, name: 'changes', description: 'The changes to document', required: true },
        { type: 3, name: 'style', description: 'Note style', required: true, choices: [
          { name: 'Formal', value: 'formal' },
          { name: 'Casual', value: 'casual' },
          { name: 'Technical', value: 'technical' }
        ]},
        { type: 3, name: 'ai_type', description: 'Type of AI to use', required: true, choices: [
          { name: 'Basic', value: 'basic' },
          { name: 'Creative', value: 'creative' },
          { name: 'Technical', value: 'technical' }
        ]}
      ]
    }
  ]);
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

  // Message handling logic can be added here if needed
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand() && !interaction.isButton()) return;

  // Blacklist system removed

  const { commandName, options } = interaction;

  // Helper function to check if user is a leader
  const isLeader = async (userId, guildId) => {
    return await db.isLeader(userId, guildId);
  };

  // Channel checks
  const checkChannel = async (channelType) => {
    const guildData = db.getGuild(interaction.guild.id);
    if (!guildData) {
      return { valid: false, message: 'Guild not set up. Please use /setlogchannel first.' };
    }
    const channelId = guildData[`${channelType}_channel_id`];
    if (channelId !== interaction.channel.id) {
      // Allow leaders to bypass channel restrictions
      const leader = await isLeader(interaction.user.id, interaction.guild.id);
      if (!leader) {
        return { valid: false, message: `This command can only be used in the designated ${channelType} channel.` };
      }
    }
    return { valid: true };
  };

  try {
    switch (commandName) {
      case 'warn':
        const warnCheck = await checkChannel('warn');
        if (!warnCheck.valid) {
          return await interaction.reply({ content: warnCheck.message, ephemeral: true });
        }
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const warnUser = options.getUser('user');
        const warnReason = options.getString('reason');

        await db.addWarn(warnUser.id, warnReason, interaction.user.id);
        const warns = await db.getWarns(warnUser.id);

        const warnEmbed = new EmbedBuilder()
          .setTitle('User Warned')
          .setColor(0xffff00)
          .addFields(
            { name: 'User', value: warnUser.toString(), inline: true },
            { name: 'Warned By', value: interaction.user.toString(), inline: true },
            { name: 'Reason', value: warnReason, inline: true },
            { name: 'Total Warns', value: warns.length.toString(), inline: true }
          );

        await interaction.reply({ embeds: [warnEmbed] });

        // Send to moderation log if 5 or more warnings
        if (warns.length >= 5) {
          const guildData = await db.getGuild(interaction.guild.id);
          if (guildData && guildData.moderation_log_channel_id) {
            const modLogChannel = interaction.guild.channels.cache.get(guildData.moderation_log_channel_id);
            if (modLogChannel) {
              const modLogEmbed = new EmbedBuilder()
                .setTitle('⚠️ User Reached 5 Warnings')
                .setColor(0xffa500)
                .addFields(
                  { name: 'User', value: warnUser.toString(), inline: true },
                  { name: 'Total Warnings', value: warns.length.toString(), inline: true },
                  { name: 'Latest Reason', value: warnReason, inline: false },
                  { name: 'Warning History', value: warns.map(w => `• ${w.reason} (${new Date(w.timestamp).toLocaleDateString()})`).join('\n'), inline: false }
                )
                .setTimestamp();

              const buttons = new ActionRowBuilder()
                .addComponents(
                  new ButtonBuilder()
                    .setCustomId(`mod_ban_${warnUser.id}`)
                    .setLabel('Ban User')
                    .setStyle(ButtonStyle.Danger),
                  new ButtonBuilder()
                    .setCustomId(`mod_timeout_${warnUser.id}`)
                    .setLabel('Timeout (1h)')
                    .setStyle(ButtonStyle.Secondary),
                  new ButtonBuilder()
                    .setCustomId(`mod_ignore_${warnUser.id}`)
                    .setLabel('Ignore')
                    .setStyle(ButtonStyle.Success)
                );

              await modLogChannel.send({ embeds: [modLogEmbed], components: [buttons] });
            }
          }
        }
        break;

      case 'ban':
        const banCheck = await checkChannel('ban');
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

      case 'mute':
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const muteUser = options.getUser('user');
        const muteReason = options.getString('reason') || 'No reason provided';
        const muteDuration = options.getString('duration');
        const muteMember = options.getMember('user');

        if (!muteMember) {
          return await interaction.reply({ content: 'User not found in this server.', ephemeral: true });
        }

        const muteMs = muteDuration ? parseInt(muteDuration) * 60 * 1000 : null;
        await muteMember.timeout(muteMs, muteReason);

        const muteEmbed = new EmbedBuilder()
          .setTitle('User Muted')
          .setColor(0xffa500)
          .addFields(
            { name: 'User', value: muteUser.toString(), inline: true },
            { name: 'Muted By', value: interaction.user.toString(), inline: true },
            { name: 'Reason', value: muteReason, inline: true }
          );
        if (muteDuration) {
          muteEmbed.addFields({ name: 'Duration', value: `${muteDuration} minutes`, inline: true });
        }
        await interaction.reply({ embeds: [muteEmbed] });
        break;

      case 'unmute':
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const unmuteUser = options.getUser('user');
        const unmuteReason = options.getString('reason') || 'No reason provided';
        const unmuteMember = options.getMember('user');

        if (!unmuteMember) {
          return await interaction.reply({ content: 'User not found in this server.', ephemeral: true });
        }

        await unmuteMember.timeout(null, unmuteReason);

        const unmuteEmbed = new EmbedBuilder()
          .setTitle('User Unmuted')
          .setColor(0x00ff00)
          .addFields(
            { name: 'User', value: unmuteUser.toString(), inline: true },
            { name: 'Unmuted By', value: interaction.user.toString(), inline: true },
            { name: 'Reason', value: unmuteReason, inline: true }
          );
        await interaction.reply({ embeds: [unmuteEmbed] });
        break;

      case 'kick':
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const kickUser = options.getUser('user');
        const kickReason = options.getString('reason') || 'No reason provided';
        const kickMember = options.getMember('user');

        if (!kickMember) {
          return await interaction.reply({ content: 'User not found in this server.', ephemeral: true });
        }

        await kickMember.kick(kickReason);

        const kickEmbed = new EmbedBuilder()
          .setTitle('User Kicked')
          .setColor(0xffa500)
          .addFields(
            { name: 'User', value: kickUser.toString(), inline: true },
            { name: 'Kicked By', value: interaction.user.toString(), inline: true },
            { name: 'Reason', value: kickReason, inline: true }
          );
        await interaction.reply({ embeds: [kickEmbed] });
        break;

      case 'clear':
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const clearAmount = options.getInteger('amount');
        const clearUser = options.getUser('user');

        if (clearAmount < 1 || clearAmount > 100) {
          return await interaction.reply({ content: 'Amount must be between 1 and 100.', ephemeral: true });
        }

        let messagesToDelete;
        if (clearUser) {
          const userMessages = await interaction.channel.messages.fetch({ limit: 100 });
          messagesToDelete = userMessages.filter(msg => msg.author.id === clearUser.id).first(clearAmount);
        } else {
          messagesToDelete = await interaction.channel.messages.fetch({ limit: clearAmount });
        }

        await interaction.channel.bulkDelete(messagesToDelete, true);

        const clearEmbed = new EmbedBuilder()
          .setTitle('Messages Cleared')
          .setColor(0x00ff00)
          .addFields({ name: 'Amount', value: messagesToDelete.size.toString(), inline: true });
        if (clearUser) {
          clearEmbed.addFields({ name: 'From User', value: clearUser.toString(), inline: true });
        }
        await interaction.reply({ embeds: [clearEmbed] });
        break;

      case 'createevent':
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const eventName = options.getString('name');
        const eventDescription = options.getString('description');
        const eventStartTime = options.getString('starttime');
        const eventChannel = options.getChannel('channel');
        const eventLocation = options.getString('location');

        const startDate = new Date(eventStartTime);
        if (isNaN(startDate.getTime())) {
          return await interaction.reply({ content: 'Invalid date format. Use YYYY-MM-DD HH:MM', ephemeral: true });
        }

        const event = await interaction.guild.scheduledEvents.create({
          name: eventName,
          scheduledStartTime: startDate,
          privacyLevel: 2, // Guild only
          entityType: eventChannel ? 2 : 3, // Voice channel or external
          description: eventDescription,
          channel: eventChannel || null,
          entityMetadata: eventLocation ? { location: eventLocation } : null
        });

        const eventEmbed = new EmbedBuilder()
          .setTitle('Event Created')
          .setColor(0x00ff00)
          .addFields(
            { name: 'Name', value: eventName, inline: true },
            { name: 'Start Time', value: startDate.toLocaleString(), inline: true },
            { name: 'ID', value: event.id, inline: false }
          );
        await interaction.reply({ embeds: [eventEmbed] });
        break;

      case 'listevents':
        const events = await interaction.guild.scheduledEvents.fetch();
        const upcomingEvents = events.filter(event => event.scheduledStartTimestamp > Date.now());

        const eventsEmbed = new EmbedBuilder()
          .setTitle('Upcoming Events')
          .setColor(0x00ff00)
          .setDescription(upcomingEvents.size > 0 ?
            upcomingEvents.map(event => `**${event.name}**\nID: ${event.id}\nTime: ${new Date(event.scheduledStartTimestamp).toLocaleString()}\n`).join('\n') :
            'No upcoming events.'
          );
        await interaction.reply({ embeds: [eventsEmbed] });
        break;

      case 'deleteevent':
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const eventId = options.getString('eventid');

        try {
          const event = await interaction.guild.scheduledEvents.fetch(eventId);
          await event.delete();

          const deleteEventEmbed = new EmbedBuilder()
            .setTitle('Event Deleted')
            .setColor(0xff0000)
            .addFields({ name: 'Event ID', value: eventId, inline: true });
          await interaction.reply({ embeds: [deleteEventEmbed] });
        } catch (error) {
          await interaction.reply({ content: 'Event not found or could not be deleted.', ephemeral: true });
        }
        break;

      case 'setwelcome':
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const welcomeChannel = options.getChannel('channel');
        const welcomeMessage = options.getString('message');

        db.addGuild(interaction.guild.id);
        db.setGuildChannel(interaction.guild.id, 'welcome', welcomeChannel.id);
        // Store welcome message (you may need to add this to database)

        const welcomeEmbed = new EmbedBuilder()
          .setTitle('Welcome Message Set')
          .setColor(0x00ff00)
          .addFields(
            { name: 'Channel', value: welcomeChannel.toString(), inline: true },
            { name: 'Message', value: welcomeMessage, inline: false }
          );
        await interaction.reply({ embeds: [welcomeEmbed] });
        break;

      case 'setautorole':
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const autoRole = options.getRole('role');

        db.addGuild(interaction.guild.id);
        // Store auto role (you may need to add this to database)

        const autoRoleEmbed = new EmbedBuilder()
          .setTitle('Auto-Role Set')
          .setColor(0x00ff00)
          .addFields({ name: 'Role', value: autoRole.toString(), inline: true });
        await interaction.reply({ embeds: [autoRoleEmbed] });
        break;

      case 'serverinfo':
        const serverEmbed = new EmbedBuilder()
          .setTitle('Server Information')
          .setColor(0x00ff00)
          .setThumbnail(interaction.guild.iconURL())
          .addFields(
            { name: 'Name', value: interaction.guild.name, inline: true },
            { name: 'ID', value: interaction.guild.id, inline: true },
            { name: 'Owner', value: `<@${interaction.guild.ownerId}>`, inline: true },
            { name: 'Members', value: interaction.guild.memberCount.toString(), inline: true },
            { name: 'Channels', value: interaction.guild.channels.cache.size.toString(), inline: true },
            { name: 'Roles', value: interaction.guild.roles.cache.size.toString(), inline: true },
            { name: 'Created', value: interaction.guild.createdAt.toLocaleDateString(), inline: true }
          );
        await interaction.reply({ embeds: [serverEmbed] });
        break;

      case 'userinfo':
        const userInfoUser = options.getUser('user') || interaction.user;
        const userInfoMember = options.getMember('user') || interaction.member;

        const userInfoEmbed = new EmbedBuilder()
          .setTitle(`${userInfoUser.username}'s Information`)
          .setColor(0x00ff00)
          .setThumbnail(userInfoUser.displayAvatarURL())
          .addFields(
            { name: 'Username', value: userInfoUser.username, inline: true },
            { name: 'Discriminator', value: userInfoUser.discriminator, inline: true },
            { name: 'ID', value: userInfoUser.id, inline: true },
            { name: 'Joined Discord', value: userInfoUser.createdAt.toLocaleDateString(), inline: true },
            { name: 'Joined Server', value: userInfoMember ? userInfoMember.joinedAt.toLocaleDateString() : 'N/A', inline: true },
            { name: 'Roles', value: userInfoMember ? userInfoMember.roles.cache.map(role => role.name).join(', ') : 'N/A', inline: false }
          );
        await interaction.reply({ embeds: [userInfoEmbed] });
        break;

      case 'setlogchannel':
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const logChannel = options.getChannel('channel');
        const logType = options.getString('type');
        db.addGuild(interaction.guild.id);
        const channelType = logType === 'general' ? 'log' : logType;
        db.setGuildChannel(interaction.guild.id, channelType, logChannel.id);
        const logEmbed = new EmbedBuilder()
          .setTitle(`${logType.charAt(0).toUpperCase() + logType.slice(1)} Log Channel Set`)
          .setColor(0x00ff00)
          .addFields({ name: 'Channel', value: logChannel.toString(), inline: true });
        await interaction.reply({ embeds: [logEmbed] });
        break;

      case 'setcmdchannel':
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const cmdChannel = options.getChannel('channel');
        const cmdTypeForChannel = options.getString('type');
        db.addGuild(interaction.guild.id);
        db.setGuildChannel(interaction.guild.id, cmdTypeForChannel, cmdChannel.id);
        const cmdEmbed = new EmbedBuilder()
          .setTitle(`${cmdTypeForChannel.charAt(0).toUpperCase() + cmdTypeForChannel.slice(1)} Command Channel Set`)
          .setColor(0x00ff00)
          .addFields({ name: 'Channel', value: cmdChannel.toString(), inline: true });
        await interaction.reply({ embeds: [cmdEmbed] });
        break;

      case 'configaichannel':
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const aiChannel = options.getChannel('channel');
        const aiEnabled = options.getBoolean('enabled');
        db.addGuild(interaction.guild.id);
        // Store AI channel configuration (you may need to add this to database)
        const aiEmbed = new EmbedBuilder()
          .setTitle('AI Channel Configured')
          .setColor(aiEnabled ? 0x00ff00 : 0xff0000)
          .addFields(
            { name: 'Channel', value: aiChannel.toString(), inline: true },
            { name: 'Status', value: aiEnabled ? 'Enabled' : 'Disabled', inline: true }
          );
        await interaction.reply({ embeds: [aiEmbed] });
        break;

      case 'setcmdtype':
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const cmdTypeChannel = options.getChannel('channel');
        const cmdTypeForType = options.getString('type');
        db.addGuild(interaction.guild.id);
        db.setGuildChannel(interaction.guild.id, cmdTypeForType, cmdTypeChannel.id);
        const cmdTypeEmbed = new EmbedBuilder()
          .setTitle(`${cmdTypeForType.charAt(0).toUpperCase() + cmdTypeForType.slice(1)} Command Type Set`)
          .setColor(0x00ff00)
          .addFields({ name: 'Channel', value: cmdTypeChannel.toString(), inline: true });
        await interaction.reply({ embeds: [cmdTypeEmbed] });
        break;

      case 'checkwarns':
        const checkWarnsCheck = await checkChannel('warn');
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
        const removeWarnCheck = await checkChannel('warn');
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
        console.log(`User ID: ${interaction.user.id}, Owner ID: ${config.ownerId}, Types: User=${typeof interaction.user.id}, Owner=${typeof config.ownerId}`);
        if (interaction.user.id !== config.ownerId) {
          console.log('Access denied: IDs do not match');
          return await interaction.reply({ content: 'This command is restricted to the bot owner.', ephemeral: true });
        }
        console.log('Access granted: IDs match');
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

      // AI COMMANDS
      case 'respond':
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const respondPrompt = options.getString('prompt');
        const respondAiType = options.getString('ai_type');
        let respondAI;
        if (respondAiType === 'basic') respondAI = basicAI;
        else if (respondAiType === 'creative') respondAI = creativeAI;
        else if (respondAiType === 'technical') respondAI = technicalAI;
        const respondResponse = respondAI(respondPrompt, 'respond');
        const respondEmbed = new EmbedBuilder()
          .setTitle('AI Response')
          .setColor(0x00ff00)
          .setDescription(respondResponse)
          .setFooter({ text: `${respondAiType.charAt(0).toUpperCase() + respondAiType.slice(1)} AI-powered response` });
        await interaction.reply({ embeds: [respondEmbed] });
        break;

      case 'say':
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const sayText = options.getString('text');
        await interaction.reply({ content: sayText });
        break;

      case 'aisetpersona':
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const personaStyle = options.getString('style');
        db.addGuild(interaction.guild.id);
        await db.setAIPersona(interaction.guild.id, personaStyle);
        const personaEmbed = new EmbedBuilder()
          .setTitle('AI Persona Set')
          .setColor(0x00ff00)
          .addFields({ name: 'Style', value: personaStyle.charAt(0).toUpperCase() + personaStyle.slice(1), inline: true });
        await interaction.reply({ embeds: [personaEmbed] });
        break;

      case 'aichannel':
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this command.', ephemeral: true });
        }
        const aiChannelSet = options.getChannel('channel');
        db.addGuild(interaction.guild.id);
        db.setGuildChannel(interaction.guild.id, 'ai', aiChannelSet.id);
        const aiChannelEmbed = new EmbedBuilder()
          .setTitle('AI Channel Set')
          .setColor(0x00ff00)
          .addFields({ name: 'Channel', value: aiChannelSet.toString(), inline: true });
        await interaction.reply({ embeds: [aiChannelEmbed] });
        break;

      case 'aiexplain':
        const explainTopic = options.getString('topic');
        const explainAiType = options.getString('ai_type');
        let explainAI;
        if (explainAiType === 'basic') explainAI = basicAI;
        else if (explainAiType === 'creative') explainAI = creativeAI;
        else if (explainAiType === 'technical') explainAI = technicalAI;
        const explainResponse = explainAI(explainTopic, 'explain');
        const explainEmbed = new EmbedBuilder()
          .setTitle('AI Explanation')
          .setColor(0x00ff00)
          .setDescription(explainResponse)
          .setFooter({ text: `${explainAiType.charAt(0).toUpperCase() + explainAiType.slice(1)} AI-powered explanation` });
        await interaction.reply({ embeds: [explainEmbed] });
        break;

      case 'aigenerate':
        const generateSubject = options.getString('subject');
        const generateStyle = options.getString('style');
        const generateAiType = options.getString('ai_type');
        let generateAI;
        if (generateAiType === 'basic') generateAI = basicAI;
        else if (generateAiType === 'creative') generateAI = creativeAI;
        else if (generateAiType === 'technical') generateAI = technicalAI;
        const generateResponse = generateAI(`${generateSubject} in ${generateStyle} style`, 'generate');
        const generateEmbed = new EmbedBuilder()
          .setTitle('AI Idea Generation')
          .setColor(0x00ff00)
          .setDescription(generateResponse)
          .setFooter({ text: `${generateAiType.charAt(0).toUpperCase() + generateAiType.slice(1)} AI-powered generation` });
        await interaction.reply({ embeds: [generateEmbed] });
        break;

      case 'aistory':
        const storyTheme = options.getString('theme') || 'adventure';
        const storyLength = options.getString('length');
        const storyAiType = options.getString('ai_type');
        let storyAI;
        if (storyAiType === 'basic') storyAI = basicAI;
        else if (storyAiType === 'creative') storyAI = creativeAI;
        else if (storyAiType === 'technical') storyAI = technicalAI;
        const storyResponse = storyAI(`${storyTheme} ${storyLength}`, 'story');
        const storyEmbed = new EmbedBuilder()
          .setTitle('AI Story')
          .setColor(0x00ff00)
          .setDescription(storyResponse)
          .setFooter({ text: `${storyAiType.charAt(0).toUpperCase() + storyAiType.slice(1)} AI-generated story` });
        await interaction.reply({ embeds: [storyEmbed] });
        break;

      case 'aidevnotes':
        const devChanges = options.getString('changes');
        const devStyle = options.getString('style');
        const devAiType = options.getString('ai_type');
        let devAI;
        if (devAiType === 'basic') devAI = basicAI;
        else if (devAiType === 'creative') devAI = creativeAI;
        else if (devAiType === 'technical') devAI = technicalAI;
        const devNotes = devAI(`${devChanges} in ${devStyle} style`, 'devnotes');
        const devEmbed = new EmbedBuilder()
          .setTitle('AI Developer Notes')
          .setColor(0x00ff00)
          .setDescription(devNotes)
          .setFooter({ text: `${devAiType.charAt(0).toUpperCase() + devAiType.slice(1)} AI-generated notes` });
        await interaction.reply({ embeds: [devEmbed] });
        break;

      default:
        await interaction.reply({ content: 'Unknown command.', ephemeral: true });
        break;
    }

    // Handle button interactions
    if (interaction.isButton()) {
      const customId = interaction.customId;
      if (customId.startsWith('mod_')) {
        const parts = customId.split('_');
        const action = parts[1];
        const userId = parts[2];

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
          return await interaction.reply({ content: 'You don\'t have permission to use this.', ephemeral: true });
        }

        try {
          const targetMember = await interaction.guild.members.fetch(userId);
          if (!targetMember) {
            return await interaction.reply({ content: 'User not found in this server.', ephemeral: true });
          }

          if (action === 'ban') {
            await interaction.guild.members.ban(targetMember, { reason: 'Reached 5 warnings' });
            await interaction.reply({ content: `Banned ${targetMember.user.tag}.`, ephemeral: true });
          } else if (action === 'timeout') {
            await targetMember.timeout(60 * 60 * 1000, 'Reached 5 warnings');
            await interaction.reply({ content: `Timed out ${targetMember.user.tag} for 1 hour.`, ephemeral: true });
          } else if (action === 'ignore') {
            await interaction.reply({ content: 'Ignored.', ephemeral: true });
          }
        } catch (error) {
          console.error('Error handling button interaction:', error);
          await interaction.reply({ content: 'An error occurred while processing this action.', ephemeral: true });
        }
      }
    }
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'An error occurred while executing this command.', ephemeral: true });
    } else {
      await interaction.reply({ content: 'An error occurred while executing this command.', ephemeral: true });
    }
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
