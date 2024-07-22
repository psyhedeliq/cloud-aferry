require('dotenv').config();

const event = require('./event.json');
const { handler } = require('./dist/index');

handler(event);
