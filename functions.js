const fs = require('fs');
const csv = require('csv-parser');
const schedule_data = [];
const submission_data = [];

function toUnix(date, time) {
    let dt = new Date(`${date}T${time}`);
    let unix = Math.floor(dt.getTime() / 1000).toFixed(0);
    return `<t:${unix}>`;
}

fs.createReadStream('schedule.csv') // Replace with your actual CSV file path
    .pipe(csv(['Date', 'Time', 'Course Code', 'Type', 'Instructor', 'Notes']))
    .on('data', (row) => {
        // Push each row as an object into the schedule_data array
        schedule_data.push({
            Date: row['Date'],
            Time: row['Time'],
            CourseCode: row['Course Code'],
            Type: row['Type'],
            Instructor: row['Instructor'],
            Notes: row['Notes']
        });

    })
    .on('end', () => {
        //console.table(schedule_data);
        // After all data has been read, find the next upcoming event
        const nextEvent = getNextEvent(schedule_data);
        if (nextEvent) {
            console.log("Next upcoming lecture:", nextEvent);
        } else {
            console.log("No upcoming events found.");
        }
    })
    .on('error', (err) => {
        console.error('Error reading the file:', err);
    });

fs.createReadStream('submission.csv') // Replace with your actual CSV file path
    .pipe(csv(['Submission', 'Date', 'Time']))
    .on('data', (row) => {
        // Push each row as an object into the submission_data array
        submission_data.push({
            Submission: row['Submission'],
            Date: row['Date'],
            Time: row['Time'],
        });
    })
    .on('end', () => {
        // After all data has been read, find all events on the next upcoming day
        const nextDayEvents = getNextDayEvents(submission_data);
        if (nextDayEvents.length > 0) {
            console.log("Events on the next upcoming day:", nextDayEvents);
        } else {
            console.log("No upcoming events found.");
        }
    })
    .on('error', (err) => {
        console.error('Error reading the file:', err);
    });

/**
 * Function to find all events on the next upcoming day
 */
function getNextDayEvents(events) {
    const now = new Date();
    let nextEventDate = null;

    // Find the next upcoming event date
    events.forEach((event) => {
        const eventDateTime = new Date(`${event.Date}T${event.Time}`);

        // Only consider future events
        if (eventDateTime > now) {
            const eventDate = eventDateTime.toISOString().split('T')[0]; // Get only the date part
            if (!nextEventDate || eventDate < nextEventDate) {
                nextEventDate = eventDate;
            }
        }
    });

    // Return all events that match the nextEventDate
    if (nextEventDate) {
        return events.filter(event => event.Date === nextEventDate);
    } else {
        return []; // No upcoming events
    }
}


/**
 * Function to find the next upcoming event based on Date and Time
 */
function getNextEvent(events) {
    const now = new Date();

    let nextEvent = null;
    let nextEventTime = null;

    events.forEach((event) => {
        const eventDateTime = new Date(`${event.Date}T${event.Time}`);

        // Only consider future events
        if (eventDateTime > now) {
            if (!nextEventTime || eventDateTime < nextEventTime) {
                nextEvent = event;
                nextEventTime = eventDateTime;
            }
        }
    });

    return nextEvent;
}


module.exports = { toUnix, getNextEvent, getNextDayEvents, schedule_data, submission_data };