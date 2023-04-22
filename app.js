const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config/config');
const connect = require('./config/dbConnection');

app.get("/", (req, res) => {
  res.send("App start...");
});

connect.then((db) => {
  console.log(`Connected to MongoDB`);
}).catch((e) => {
  console.error(`Could not init db\n${e.trace}`);
});

app.use(cors());
app.use(bodyParser.json());

require('./modules/router')(app);



const server = express().use(app).listen(config.port, () => console.log(`Listening on Port: ${config.port}`));