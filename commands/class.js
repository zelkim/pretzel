const { fetchCourseClasses } = require('../utils/parser');

module.exports = {
    config: {
        name: 'class',
        description: 'Get info of a class',
        usage: `!class [course code] [id or section]`,
    },
    async run(bot, message, args) {
        const { EmbedBuilder } = require('discord.js')
        message.channel.send("Loading class...");

        if (args.length < 2) {
            const embed = new EmbedBuilder()
                .setTitle("Invalid Syntax")
                .setDescription("**USAGE:** `!class [course code (Ex. CCPROG2)] [id or section (Ex. 4512, A52C)]`")
                .setColor("#f50000");

            await message.reply({ embeds: [embed] });
            return;
        }

        const fs = require('fs');
        const parser = require.main.require('./utils/parser.js')
        try {
            const course = args[0].toString().trim().toLowerCase();
            const _class = args[1].toString().trim().toLowerCase();

            courseContent = await parser.fetchCourseClasses(course)

            let index = -1;
            for (let i = 0; i < courseContent.length; i++) {
                if (courseContent[i].id === _class.toString() || courseContent[i].section.toLowerCase() === _class.toString()) {
                    index = i;
                    break;
                }
            }

            if (index == -1) {
                const embed = new EmbedBuilder()
                    .setTitle("Class not found")
                    .setDescription("Please check if you inputted the right course code, class ID, or section.\n**USAGE:** `!class [course code (Ex. CCPROG2)] [id or section (Ex. 4512, A52C)]`")
                    .setColor("#f50000");

                await message.reply({ embeds: [embed] });
                return;
            }

            await message.reply({ embeds: [parser.buildClassEmbed(courseContent[index])] })

        }
        catch (err) {
            console.log('error: ' + JSON.stringify(err))
        }
    }
}
