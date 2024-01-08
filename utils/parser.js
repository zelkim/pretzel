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
  console.log(`attempting to load ${course.toLowerCase()}.json`);

  if (Date.now() - await classLastUpdated(course.toLowerCase()) > 30000)
    updateClass(course.toLowerCase());

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
      prof: data[index + 19] ?? "N/A"
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
          prof: data[index + 42] ?? "N/A"
        }
      )
      console.log('passed else 1')
    }
  }
  console.log('parsed item: ' + JSON.stringify(currentItem));
  return currentItem;
}

const classLastUpdated = async function(classname) {
  console.log('classLastUpdated: started')
  try {
    console.log('classLastUpdated: try')
    let config = fs.readFileSync('./courses.json')
    let classInfo = JSON.parse(config)
    let index = -1;

    for (let i = 0; i < classInfo.length; i++) {
      if (classInfo[i].name === classname.toString().toLowerCase().trim()) index = i;
    }
    console.log('classLastUpdated: index = ' + index)
    if (index == -1) {
      console.log('classLastUpdated: index = -1')
      await updateClass(classname);
      return await classLastUpdated(classname);
    }
    return classInfo[index].last_updated;

  } catch (err) {
    console.log('classLastUpdated: ERROR: ' + err)
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
    console.log('updateClass:PythonShell.run: post await')
    try {
      let courseConfig = JSON.parse(fs.readFileSync('./courses.json'))
      console.log('updateClass:PythonShell.run: passed readFileSync')

      let index = -1;
      for (let i = 0; i < courseConfig.length; i++) {
        if (courseConfig[i][`name`] === classname.toLowerCase().trim()) {
          index = i;
          break;
        }
      }
      console.log('updateClass:PythonShell.run: index = ' + index)
      if (index == -1) {
        courseConfig.push({
          'name': classname.toLowerCase().trim(),
          'last_updated': Date.now()
        })
      }
      else
        courseConfig[index][`last_updated`] = Date.now();

      console.log('updateClass:PythonShell.run: passed setting last_updated')
      fs.writeFileSync('courses.json', JSON.stringify(courseConfig))
      console.log('updateClass:PythonShell.run: passed writeFileSync')
    } catch (err) {
      console.log('updateClass:ERROR: ' + err)
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
