module.exports = {
    config: {
        name: 'help',
        description: 'A guide on how to use the bot.',
        usage: `!help`,
    },
    async run(bot, message, args) {
        message.channel.send("My ping is \`" + bot.ws.ping + " ms\`");
    }
}
