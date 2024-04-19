const { EmbedBuilder } = require('discord.js')

module.exports = {
    config: {
        name: 'help',
        description: 'A guide on how to use the bot.',
        usage: `!help`,
    },
    async run(bot, message, args) {
        const embed = new EmbedBuilder()
            .setTitle("pretzel")
            .setDescription("Access the DLSU Course Offerings through discord!\n\n**COMMANDS:**\n```\n!open <course code>\n!class <course code> <class ID or section>\n```\nExample usage:\n`!open CCPROG3`\n`!open LCFAITH z29`")
            .setThumbnail("https://i.imgur.com/meFtxzo.png")
            .setColor("#a3ffc3")
            .setFooter({
                text: "Developed by zel :)",
                iconURL: "https://i.imgur.com/meFtxzo.png",
            });

        await message.channel.send({ embeds: [embed] });
    }
}
