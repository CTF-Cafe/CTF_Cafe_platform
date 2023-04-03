/* 
FUNCTION : Register plugins to api
AUTHOR : RAXO
*/

// FUNCTIONAL IMPORTS
const api = require("../_mainframe/api");
const fs = require("fs/promises");
const path = require("path");

async function registerPlugins(dirPath) {
  // Read through Directory to get all sections/routes
  const items = await fs.readdir(dirPath);

  // listing all items using for loop
  for (const item of items) {
    const stats = await fs.stat(`${dirPath}/${item}`);

    // Register Routes on API
    if (stats.isDirectory()) {
      const init = require(`${dirPath}/${item}/init.js`);
      init(api);
    }
  }
}

async function init() {
  const dirPath = path.join(__dirname, "./");
  await registerPlugins(dirPath);
}

init();
