require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_BOT_TOKEN,
  databasePath: './vexen_bot.db',
  defaultXpPerMessage: 5,
  defaultLevelUpMultiplier: 1.2,
  defaultWarnLimit: 3
};
