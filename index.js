"use strict";

const Discord = require("discord.js");
const fs = require("fs");
const { parse } = require("csv-parse");
const { stringify } = require("querystring");
require('dotenv').config();

//Discordbotens token deklareras från .env filen för att hålla den säker från angripare.
const TOKEN = process.env.DISCORD_TOKEN;

const client = new Discord.Client({
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "MESSAGE_CONTENT"],
    partials: ["CHANNEL", "MESSAGE"]
});

client.on('ready', async () => {
    console.log(`Client has been initiated! ${client.user.username}`)
});


client.on('messageCreate', async (message) => {
    if (message.content.toLowerCase() === "lektion") {
        const data = [];
        fs.createReadStream("./schedule.csv")
            .pipe(
                parse({
                    delimiter: ",",
                    columns: true,
                    ltrim: false,
                })
            )
            .on("data", function (row) {
                //Lägger in schemadatan per rad från schedule.csv filen.
                data.push(row);
            })
            .on("error", function (error) {
                console.log(error.message);
            })
            .on("end", function () {
                /*
                console.log("parsed csv data:");
                console.log(data);
                */
                const dates = [];

                let arrayLength = data.length;
                for (let i = 0; i < arrayLength; i++) {
                    let tmp = stringify(data[i]);
                    let onlydate = tmp.split('Date=').pop().split('Time=')[0].replace('%20', ' ').replace('&', ' ').replace(/\D/g,'');
                    let year = onlydate.substring(0, 4);
                    let month = Number(onlydate.substring(4, 6))-1;
                    let day = onlydate.substring(6, 8);

                    let onlytime = tmp.split('Time=').pop().split('Course')[0].replace('%20', ' ').replace('%20', ' ').replace('&', ' ').replace('%3A', ';').replace('%3A', ';');
                    
                    let hours = onlytime.substring(0, 2);
                    
                    let minutes = onlytime.substring(3, 5);
                    
                    let fulldate = new Date(year, month, day, hours, minutes)
                    //Lägger in exakta tidsvärden:
                    dates.push(fulldate);
                    
                }
                let currentdate = new Date();
                let index = 0;
                let text = "";
                do{
                    console.log(dates[index] + " " + currentdate)
                    text = Math.floor((dates[index]).getTime()/1000).toFixed(0);

                }while((currentdate.getTime() - dates[index++].getTime()) > 0);

                message.reply("Nästa lektion är: "+ "<t:"+ text +">");
            });

    }
});

client.login(TOKEN);