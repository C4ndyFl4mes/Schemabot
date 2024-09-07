"use strict";

const Discord = require("discord.js");
const fs = require("fs");
const { parse } = require("csv-parse");
const { stringify } = require("querystring");
require('dotenv').config();

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
                * Deklarerar lessons som ska hålla reda på lektioner.
                * Deklarerar description som ska hålla reda på vad lektionerna handlar om, föreläsning/uppföljning/m.m.
                */
                const dates = [];
                const lessons = [];
                const descriptions = [];
                for (let i = 0; i < data.length; i++) {
                    let tmp = stringify(data[i]);

                    //Datum, år, månad och dag:
                    let onlydate = tmp.split('Date=').pop().split('Time=')[0].replace('%20', ' ').replace('&', ' ').replace(/\D/g, '');
                    let year = onlydate.substring(0, 4);
                    let month = Number(onlydate.substring(4, 6)) - 1;
                    let day = onlydate.substring(6, 8);

                    //Tid, timmar och minuter:
                    let onlytime = tmp.split('Time=').pop().split('Course')[0].replace('%20', ' ').replace('%20', ' ').replace('&', ' ').replace('%3A', ';').replace('%3A', ';');
                    let hours = onlytime.substring(0, 2);
                    let minutes = onlytime.substring(3, 5);

                    //Deklarerar schemats datum som Date-objekt och lägger in:
                    dates.push(new Date(year, month, day, hours, minutes));

                    descriptions.push(tmp.split('Type=').pop().split('&')[0].replace('%C3%B6', "ö").replace('%C3%96', "Ö").replace('%C3%A4', 'ä'));

                    switch (tmp.split('Code=').pop().split('&')[0]) {
                        case "DT084G":
                            lessons.push("JavaScript: "+URL1);
                            break;
                        case "DT057G":
                            lessons.push("Webbutveckling 1: "+URL2);
                            break;
                        default:
                            //console.log("Error");
                            break;
                    }
                }
                /*
                * currentdate är den exakta nupunkten.
                * index hjälper oss att loopa indexeringsvärden i arrayen dates.
                * text deklareras utanför do-while-loopen för att ge räckvidd i loopen 
                * där den tilldelas ett värde och till message.reply där den 
                * konkateneras med utskriftsmeddelandet.
                * lesson innehåller vad det är för lektion och Zoom-Länken.
                * description innehåller om vad lektionen ska gå ut på, föreläsning/uppföljning/m.m.
                */
                let currentdate = new Date();
                let index = 0;
                let text = "";
                let lesson = "";
                let description = "";
                do {
                    //console.log(dates[index] + " " + currentdate);
                    text = Math.floor((dates[index]).getTime() / 1000).toFixed(0); //<---------Översätter till unixtime.
                    lesson = lessons[index];
                    description = descriptions[index];
                } while ((currentdate.getTime() - dates[index++].getTime()) > 0); //<-----------Ser till att vi får det första datumet efter nupunkten.

                message.reply(`Nästa lektion är: <t:${text}>\n${lesson}: ${description}`);
            });

    } else if (message.content.toLowerCase() === "inlämning") {
        const data = [];
        fs.createReadStream("./submission.csv")
            .pipe(
                parse({
                    delimiter: ",",
                    columns: true,
                    ltrim: false,
                })
            )
            .on("data", function (row) {
                data.push(row); //<---------------Lägger in inlämningsinformation per rad från submission.csv filen.
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
                * Deklarerar dates som håller exakta datum och tiderna för nästa inlämning.
                * For-loopen går igenom varje rad i data-arrayen gör dem till strängar och 
                * återskapar mellanslag och tar bort andra tecken.
                * Därefter tar ut år, månad, dag, timmar och minuter.
                * Deklarerar submission_information som håller inlämningsinformationen.
                */
                let dates = [];
                const submission_information = [];
                for (let i = 0; i < data.length; i++) {
                    let tmp = stringify(data[i]);

                    //Datum, år, månad, dag, timmar och minuter:
                    let submission_date = new Date(tmp.split("Date=").pop().split("&")[0] + "T" + tmp.split("Time=").pop().split("&")[0].replace('%3A', ':'));
                    dates.push(submission_date);
                    //Inlämningsinformation
                    let submission = tmp.split("Submission=").pop().split("&")[0].replace('%20', ' ').replace('%20', ' ').replace('%20', ' ').replace('%20', ' ').replace('%20', ' ').replace('%20', ' ').replace('%20', ' ').replace('%26', '&').replace('%C3%B6', 'ö');
                    submission_information.push(submission);
                }
                /*
                * currentdate är den exakta nupunkten.
                * index hjälper oss att loopa indexeringsvärden i arrayen dates och submission_information.
                * text_dates och text_information deklareras utanför do-while-loopen för att ge räckvidd i loopen 
                * där de tilldelas värden och till message.reply där de 
                * konkateneras med utskriftsmeddelandet.
                */
                let currentdate = new Date();
                let index = 0;
                let text_dates = [];
                let text_information = [];
                do {
                    text_dates.push(Math.floor((dates[index]).getTime() / 1000).toFixed(0)); //<-------Översätter till unixtime.
                    text_information.push(submission_information[index]);
                    if (dates[index].getDate() === dates[index + 1].getDate()) { //<----------------------Kollar om nästa datum har samma inlämningsdag som den nuvarande.
                        console.log(dates[index + 1] + " | " + dates[index]);
                        text_dates.push(Math.floor((dates[index + 1]).getTime() / 1000).toFixed(0)); //<-------Översätter till unixtime.
                        text_information.push(submission_information[index + 1]);
                    }
                } while ((currentdate.getTime() - dates[index++].getTime()) > 0); //<--------------------------Sålänge att nästa inlämningsdatum inte är före nupunkten.

                for (let i = 0; i < text_dates.length; i++) {
                    if (text_dates[i] >= Math.floor((currentdate).getTime() / 1000).toFixed(0)) { //<------------------Ser till att nästa inlämningsdatum är efter nupunkten.
                        message.reply(`Nästa inlämningsdatum är <t:${text_dates[i]}> \n${text_information[i]}`);
                    }
                }
            });
    }
});

client.login(TOKEN);