const fs = require('fs');
const { PythonShell } = require('python-shell');

const buildClassEmbed = function(data) {
  const { EmbedBuilder } = require('discord.js')
  const embed = new EmbedBuilder()
    .setTitle(`${data.class} (${data.section})`)
    .setDescription(`ID: \`${data.id}\` | Capacity: \`${data.current_slots}/${data.max_slots}\` | Type: \`${data.type.trim()}\``)
    .addFields(
      {
        name: "Schedules:",
        value: `\`\`\`${data.schedules.map((a) => `${a.days} - ${a.time} - ${a.prof}\n`).join('')}\`\`\``,
        inline: false
      }
    )
    .setThumbnail("https://altdsi.dlsu.edu.ph/uploads/img/logo/dlsulogowhite.png")
    .setColor("#77fd92");

  return embed;
}

const fetchCourseClasses = async function(course = '') {

  if (Date.now() - await classLastUpdated(course.toLowerCase()) > 30000)
    updateClass(course.toLowerCase());

  let raw = fs.readFileSync(`./raw/${course.toLowerCase()}.json`);

  let rawdata = JSON.parse(raw.toString());

  var data = [];

  console.log(rawdata);
  for (let i = 0; i < rawdata.length; i++) {
    if (Number(rawdata[i].trim()) > 200) {
      data.push(createClassObject(rawdata, i));
    }
  }
  return data;
}

const createClassObject = function(data, index = 0) {

  if (!Number(data[index]))
    return { 'error': 'could not parse integer class id.' };

  if (data[index] <= 200)
    return { 'error': 'invalid class id submitted.' };

  let currentItem = __class_reset();

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
      prof: data[index + 19] ?? "N/A"
    }
  )
  // 29 26
  // checking these indexes to see if there is a second schedule 
  if (!Number(data[index + 20]) && !Number(data[index + 20])) {
    if (is_empty(data[index + 19])) // if the class does not have a prof on the default schedule
    {
      currentItem['schedules'].push(
        {
          days: data[index + 26],
          time: data[index + 28],
          room: data[index + 30],
          prof: "N/A"
        }
      )
    }
    else {
      currentItem['schedules'].push(
        {
          days: data[index + 29],
          time: data[index + 31],
          room: data[index + 30],
          prof: data[index + 42] ?? "N/A"
        }
      )
    }
  }
  // console.log('parsed item: ' + JSON.stringify(currentItem));
  return currentItem;
}

const classLastUpdated = async function(classname) {
  try {
    let config = fs.readFileSync('./courses.json')
    let classInfo = JSON.parse(config)
    let index = -1;

    for (let i = 0; i < classInfo.length; i++) {
      if (classInfo[i].name === classname.toString().toLowerCase().trim()) index = i;
    }
    if (index == -1) {
      await updateClass(classname);
      return await classLastUpdated(classname);
    }
    return classInfo[index].last_updated;

  } catch (err) {
    if (err.code === 'ENOENT') {
      fs.writeFileSync('courses.json', '[]');
      return await classLastUpdated(classname);
    }
  }
}

const updateClass = async function(classname) {
  console.log('updateClass: started')
  try {
    await PythonShell.run('./scraper.py', { args: classname }).then(messages => {
      for (let i = 0; i < messages.length; i++) console.log(messages[i])
    });
    try {
      let courseConfig = JSON.parse(fs.readFileSync('./courses.json'))

      let index = -1;
      for (let i = 0; i < courseConfig.length; i++) {
        if (courseConfig[i][`name`] === classname.toLowerCase().trim()) {
          index = i;
          break;
        }
      }
      if (index == -1) {
        courseConfig.push({
          'name': classname.toLowerCase().trim(),
          'last_updated': Date.now()
        })
      }
      else
        courseConfig[index][`last_updated`] = Date.now();

      fs.writeFileSync('courses.json', JSON.stringify(courseConfig))
    } catch (err) {
      if (err.code === 'ENOENT') {
        fs.writeFileSync('courses.json', '[]');
        return updateClass(classname);
      }
    }
  } catch (err) {
    console.log('ERROR OCCURED: ' + JSON.stringify(err));
  }
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

module.exports = { buildClassEmbed, createClassObject, fetchCourseClasses, classLastUpdated, updateClass }
