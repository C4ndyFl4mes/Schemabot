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
    console.log(`Boten har startats! ${client.user.username}`)
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
                data.push(row); //<---------------Lägger in schemadatan per rad från schedule.csv filen.
            })
            .on("error", function (error) {
                console.log(error.message);
            })
            .on("end", function () {
                /*
                console.log("parsed csv data:");
                console.log(data);
                */
                /*
                * Deklarerar dates som ska hålla de exakta datum och tiderna för nästa lektion.
                * For-loopen går igenom varje rad i data-arrayen gör dem till strängar och 
                * återskapar mellanslag och tar bort andra tecken.
                * Därefter tar ut år, månad, dag, timmar och minuter.
                *
                */
                const dates = [];
                for (let i = 0; i < data.length; i++) {
                    let tmp = stringify(data[i]);

                    //Datum, år, månad och dag:
                    let onlydate = tmp.split('Date=').pop().split('Time=')[0].replace('%20', ' ').replace('&', ' ').replace(/\D/g,'');
                    let year = onlydate.substring(0, 4);
                    let month = Number(onlydate.substring(4, 6))-1;
                    let day = onlydate.substring(6, 8);

                    //Tid, timmar och minuter:
                    let onlytime = tmp.split('Time=').pop().split('Course')[0].replace('%20', ' ').replace('%20', ' ').replace('&', ' ').replace('%3A', ';').replace('%3A', ';');
                    let hours = onlytime.substring(0, 2);
                    let minutes = onlytime.substring(3, 5);
                    
                    //Deklarerar schemats datum som Date-objekt och lägger in:
                    dates.push(new Date(year, month, day, hours, minutes)); 
                    
                }
                /*
                * currentdate är den exakta nupunkten.
                * index hjälper oss att loopa indexeringsvärden i arrayen dates.
                * text deklareras utanför do-while-loopen för att ge räckvidd i loopen 
                * där den tilldelas ett värde och till message.reply där den 
                * konkateneras med utskriftsmeddelandet.
                */
                let currentdate = new Date();
                let index = 0; 
                let text = "";
                do{
                    console.log(dates[index] + " " + currentdate);
                    text = Math.floor((dates[index]).getTime()/1000).toFixed(0); //<---------Översätter till unixtime.

                }while((currentdate.getTime() - dates[index++].getTime()) > 0);

                message.reply("Nästa lektion är: "+ "<t:"+ text +">");
            });

    }
});

client.login(TOKEN);