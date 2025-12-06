# Vexen Bot

A powerful Discord bot built with JavaScript and discord.js, featuring moderation commands, leveling system, and event logging.

## Features

### Moderation Commands
- `/warn` - Warn users (auto-ban after 3 warnings)
- `/ban` - Ban users from the server
- `/blacklist` - Prevent users from using commands
- `/timeout` - Temporarily mute users

### Leveling System
- Automatic XP gain from messages
- Level up notifications
- `/level` - Check your or another user's level

### Event Logging
- OnJoined - Logs when members join
- OnLeft - Logs when members leave (with duration and roles)
- OnBoosted - Logs when members boost the server

### Setup Commands
- `/setlogchannel` - Set the channel for event logs
- `/setwarnchannel` - Set the channel for warn commands
- `/setbanchannel` - Set the channel for ban commands
- `/setblacklistchannel` - Set the channel for blacklist commands
- `/settimeoutchannel` - Set the channel for timeout commands
- `/setlevelchannel` - Set the channel for level commands

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and add your bot token
4. Run the bot: `npm start`

## Configuration

Create a `.env` file with your Discord bot token:

```
DISCORD_BOT_TOKEN=your_bot_token_here
```

## Database

The bot uses SQLite for data persistence. The database file `vexen_bot.db` will be created automatically.

## Usage

1. Invite the bot to your server
2. Set up channels using the setup commands (e.g., `/setlogchannel #logs`)
3. Use moderation commands in their designated channels
4. Enjoy the leveling system!

## Permissions

The bot requires the following permissions:
- Read Messages
- Send Messages
- Manage Messages
- Ban Members
- Moderate Members
- Manage Guild

## Support

For support or issues, please create an issue on GitHub.
