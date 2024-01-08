const fs = require('fs');
const { PythonShell } = require('python-shell');

const buildClassEmbed = function(data) {
  const { EmbedBuilder } = require('discord.js')
  const embed = new EmbedBuilder()
    .setTitle(`${data.class} (${data.section})`)
    .setDescription(`ID: \`${data.id}\` | Capacity: \`${data.current_slots}/${data.max_slots}\` | Type: \`${data.type.trim()}\``)
    .addFields(
      {
        name: "Days",
        value: `\`${data.schedules.map((a) => `${a.days}\n`)}\``,
        inline: true
      },
      {
        name: "Time",
        value: `\`${data.schedules.map((a) => `${a.time}\n`)}\``,
        inline: true
      },
      {
        name: "Professor",
        value: `\`${data.schedules.map((a) => `${a.prof}\n`)}\``,
        inline: true
      },
    )
    .setThumbnail("https://altdsi.dlsu.edu.ph/uploads/img/logo/dlsulogowhite.png")
    .setColor("#77fd92");

  return embed;
}

const fetchCourseClasses = async function(message, course = '') {
  console.log(`attempting to load ${course.toLowerCase()}.json`);
  message.channel.send({ content: 'Loading classes...' })

  // if (classLastUpdated(course.toLowerCase() > 5))
  await updateClass(course.toLowerCase());

  let raw = fs.readFileSync(`./raw/${course.toLowerCase()}.json`);

  console.log(`${course.toLowerCase()}.json loaded`);
  let rawdata = JSON.parse(raw.toString());

  var data = [];

  for (let i = 0; i < rawdata.length; i++) {
    if (Number(rawdata[i]) > 999) {
      data.push(createClassObject(rawdata, i));
    }
  }
  console.log(`final data list: ${JSON.stringify(data)}`);
  return data;
}

const createClassObject = function(data, index = 0) {

  if (!Number(data[index]))
    return { 'error': 'could not parse integer class id.' };

  if (data[index] < 1000)
    return { 'error': 'invalid class id submitted.' };

  let currentItem = __class_reset();

  console.log('passed object initialization');

  console.log(`data_process_object: ${JSON.stringify(data[index])}`)
  currentItem['id'] = data[index];
  currentItem['class'] = data[index + 2];
  currentItem['type'] = data[index + 16];
  currentItem['section'] = data[index + 4];
  currentItem['max_slots'] = data[index + 12];
  currentItem['current_slots'] = data[index + 14];
  currentItem['schedules'].push(
    {
      days: data[index + 6],
      time: data[index + 8],
      room: data[index + 10],
      prof: data[index + 19]
    }
  )

  console.log('passed initial object variable declaration')

  // checking these indexes to see if there is a second schedule 
  if (!Number(data[index + 20]) && !Number(data[index + 20])) {
    console.log('entered if clause 1');
    if (is_empty(data[index + 19])) // if the class does not have a prof on the default schedule
    {
      console.log('entered if clause 2');
      currentItem['schedules'].push(
        {
          days: data[index + 26],
          time: data[index + 28],
          room: data[index + 30],
          prof: "N/A"
        }
      )
      console.log('passed if clause 2');
    }
    else {
      console.log('entered else 1')
      currentItem['schedules'].push(
        {
          days: data[index + 29],
          time: data[index + 31],
          room: data[index + 30],
          prof: data[index + 42]
        }
      )
      console.log('passed else 1')
    }
  }
  console.log('parsed item: ' + JSON.stringify(currentItem));
  return currentItem;
}

const classLastUpdated = async function(classname) {
  let config = fs.readFileSync('class_data.json')
  let classInfo = JSON.parse(config)
  let index = -1;

  for (let i = 0; i < classInfo.length; i++) {
    if (classInfo[i].name === classname) index = i;
  }

  if (index == -1) {
    await updateClass(classname);
    return classLastUpdated(classname);
  }

  return classInfo[i].last_updated;
}

const updateClass = async function(classname) {
  await PythonShell.run('./scraper.py', { args: classname }).then(messages => {
    for (let i = 0; i < messages.length; i++) console.log(messages[i])
  })
  return 1;
}

function __class_reset() {
  return {
    'id': "",
    'class': "",
    'section': "",
    'type': "",
    'max_slots': "",
    'current_slots': "",
    'schedules': []
  }
}

function is_empty(str) {
  return str === " " || str === "" || !str;
}

module.exports = { buildClassEmbed, createClassObject, fetchCourseClasses }
