module.exports = {
  config: {
    name: 'open',
    description: 'Get list of open classes of course.',
    usage: `!open [COURSE CODE]`,
  },
  async run(bot, message, args) {
    const { EmbedBuilder } = require('discord.js')
    const parser = require.main.require('./utils/parser.js')
    let response = await parser.fetchCourseClasses(message, args[0].toLowerCase());

    if ((!Array.isArray(response) && response.error)) {
      const embed = new EmbedBuilder()
        .setTitle("Syntax Error")
        .setDescription("Invalid course id. \n**USAGE:** `!open [COURSE CODE (Ex: LCFILIA)]`")
        .setColor("#f50000")
        .setFooter({
          text: "Our.LaSalle - Developed by zel.",
        });
      await message.reply({ embeds: [embed] });
      return;
    }

    console.log(`response: ${response}`)
    let embeds = [];
    let count = 0, _count_2 = 0;
    for (let i = 0; i < response.length; i++) {
      if (Number(response[i].current_slots) < Number(response[i].max_slots)) {
        embeds.push(parser.buildClassEmbed(response[i]))
        count++;
        _count_2++;
        if (_count_2 >= 10) {
          _count_2 = 0;
          await message.reply({ embeds: embeds });
          embeds.splice(0, embeds.length);
        }
      }
    }
    if (embeds != 0) await message.reply({ embeds: embeds })

    const embed = new EmbedBuilder()
      .setTitle(`${count} open class(es)`)
      .setDescription(`There are a total of \`${count}\` available class(es) to enlist for \`${args[0].toUpperCase()}\``)
      .setFooter({
        text: "Our.LaSalle - Developed by zel.",
      })
      .setColor("#77fd92");

    await message.channel.send({ embeds: [embed] })
  }
}
