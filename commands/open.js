const dayjs = require('dayjs');
const { classLastUpdated } = require('../utils/parser');

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

    function date_diff(d1, d2) {
      let date1 = new Date(d1)
      let date2 = new Date(d2)
      let Difference_In_Time = date1.getTime() - date2.getTime();
      let months = 0;
      let days = 0;
      let hours = 0;
      let minutes = 0;
      let seconds = 0;
      months = Math.round(Difference_In_Time / (1000 * 3600 * 24 * 30))
      days = Math.round(Difference_In_Time / (1000 * 3600 * 24));
      hours = Math.round(Difference_In_Time / (1000 * 3600));
      minutes = Math.round(Difference_In_Time / (1000 * 60));
      seconds = Math.round(Difference_In_Time / 1000);
      let final_date = '';
      if (months > 0) final_date = final_date + months.toString() + 'months, ';
      if (days > 0) final_date = final_date + days.toString() + 'days, ';
      if (hours > 0) final_date = final_date + hours.toString() + 'hours, ';
      if (minutes > 0) final_date = final_date + minutes.toString() + 'minutes, ';
      final_date = final_date + seconds.toString() + 'seconds ';
      return final_date + 'ago';
    }
    console.log(`classLastUPdated: ${await parser.classLastUpdated(args[0].toLowerCase())}`)

    const embed = new EmbedBuilder()
      .setTitle(`${count} open class(es)`)
      .setDescription(`There are a total of \`${count}\` available class(es) to enlist for \`${args[0].toUpperCase()}\`` +
        `\nLast Updated: ${dayjs(Date.now()).diff(dayjs(await parser.classLastUpdated(args[0].toLowerCase())), 'seconds')} seconds ago.`)
      .setFooter({
        text: "Our.LaSalle - Developed by zel.",
      })
      .setColor("#77fd92");

    await message.channel.send({ embeds: [embed] })
  }
}
