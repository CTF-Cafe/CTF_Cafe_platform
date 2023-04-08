/*
FUNCTION : Register plugins to api
AUTHOR : RAXO
*/

// FUNCTIONAL IMPORTS
const express = require("express");
const bodyparser = require("body-parser");
const registerRoutes = require("./_mainframe/registerRoutes");
const registerPlugins = require("./_plugins/registerPlugins");
const api = require("./_mainframe/api");

// SETUP CONSTS
const app = express();
const port = process.env.PORT || 3001;

// Body-parser middleware
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

(async () => {
  app.use("/", await registerRoutes());
  await registerPlugins();

  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });  
})();