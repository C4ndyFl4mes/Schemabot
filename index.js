"use strict"

const Discord = require("discord.js");
require('dotenv').config();
const { toUnix, getNextEvent, getNextDayEvents, schedule_data, submission_data } = require("./functions.js");
//Discordbotens token deklareras från .env filen för att hålla den säker från angripare.
const TOKEN = process.env.DISCORD_TOKEN;

//URL1 leder till JavaScript Zoom-mötet. URL2 leder till Webbutveckling 1 Zoom-mötet.
const URL1 = process.env.URL_JAVASCRIPT;
const URL2 = process.env.URL_WEBB1;

const client = new Discord.Client({
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "MESSAGE_CONTENT"],
    partials: ["CHANNEL", "MESSAGE"]
});

client.on('ready', async () => {
    console.log(`Boten har startats! ${client.user.username}`);
});

client.on('messageCreate', async (message) => {
    if (message.content.toLowerCase() === "lektion") {
        const nextEvents = getNextDayEvents(schedule_data);
        nextEvents.forEach(nextEvent => {
            if (nextEvent) {
                const time = toUnix(nextEvent.Date, nextEvent.Time);
                if (nextEvent.CourseCode === "DT057G") {
                    message.reply(`Webbutveckling 1: ${nextEvent.Type} ${time} \n${URL2}`);
                } else if (nextEvent.CourseCode === "DT084G") {
                    message.reply(`JavaScript ${nextEvent.Type} ${time} \n${URL1}`);
                }
    
            } else {
                message.reply("ERROR");
            }
        });
    
    }
});

client.on('messageCreate', async (message) => {
    if (message.content.toLocaleLowerCase() === "inlämning") {
        const nextEvents = getNextDayEvents(submission_data);
        nextEvents.forEach(nextEvent => {
            if(nextEvent){
                const time = toUnix(nextEvent.Date, nextEvent.Time);
                message.reply(`${nextEvent.Submission} ${time}`);
            }
        });
    }
});


client.login(TOKEN);