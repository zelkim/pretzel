module.exports = {
    config: {
        name: 'burat',
        description: 'Get ping of the bot',
        usage: `!burat`,
    },
    async run(bot, message, args) {
        message.channel.send("bastos k potangina m");
        console.log('burat engaged');
    }
}
