/* 
FUNCTION : Register routes in _sections directory
AUTHOR : RAXO
*/

// FUNCTIONAL IMPORTS
const api = require("./api");
const fs = require("fs/promises");
const path = require("path");

async function recursiveRegisterRoutes(dirPath, scope) {
  // Read through Directory to get all sections/routes
  const items = await fs.readdir(dirPath);

  // listing all items using for loop
  for (const item of items) {
    const stats = await fs.stat(`${dirPath}/${item}`);

    // Register Routes on API
    if (stats.isFile() && item.endsWith(".js")) {
      const route = require(`${dirPath}/${item}`);
      scope.addRoute(
        item.slice(0, -3),
        route.verify,
        route.manipulate,
        route.respond,
        route.method
      );
    } else if (stats.isDirectory()) {
      scope.addSection(item);
      await recursiveRegisterRoutes(`${dirPath}/${item}`, scope[item]);
    }
  }
}

async function init() {
  const dirPath = path.join(__dirname, "../_sections");
  await recursiveRegisterRoutes(dirPath, api);
}

init();
