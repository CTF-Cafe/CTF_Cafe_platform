/* 
FUNCTION : Register routes in _sections directory
AUTHOR : RAXO
*/

// FUNCTIONAL IMPORTS
const api = require("./api");
// const errorHandler = require("./errorHandler");
const fs = require("fs/promises");
const path = require("path");
const express = require("express");

// SETUP CONSTS
const router = express.Router();

async function recursiveRegisterRoutes(dirPath, scope) {
  // Read through Directory to get all sections/routes
  const items = await fs.readdir(dirPath);

  // listing all items using for loop
  for (const item of items) {
    const stats = await fs.stat(`${dirPath}/${item}`);

    // Register Routes on API
    if (stats.isFile() && item.endsWith(".js")) {
      const route = require(`${dirPath}/${item}`);

      // Save Route in API
      scope.addRoute(
        item.slice(0, -3),
        route.verify,
        route.manipulate,
        route.respond,
        route.method
      );

      // Register to router
      if (route.method == "POST") {
        router.post(scope[item.slice(0, -3)].path, async (req, res) => {
          try {
            await scope[item.slice(0, -3)].entry(req, res);
          } catch (e) {
            res.message = { state: "error", msg: e.message };
          }
          res.send(res.message);
        });
      } else if (route.method == "GET") {
        router.get(scope[item.slice(0, -3)].path, async (req, res) => {
          try {
            await scope[item.slice(0, -3)].entry(req, res);
          } catch (e) {
            res.message = { state: "error", msg: e.message };
          }
          res.send(res.message);
        });
      }
    } else if (stats.isDirectory()) {
      // Register Routes inside section
      scope.addSection(item);
      await recursiveRegisterRoutes(`${dirPath}/${item}`, scope[item]);
    }
  }
}

async function init(app) {
  const dirPath = path.join(__dirname, "../_sections");
  await recursiveRegisterRoutes(dirPath, api, app);
  return router;
}

module.exports = init;
