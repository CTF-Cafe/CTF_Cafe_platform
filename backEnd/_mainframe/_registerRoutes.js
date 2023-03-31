/* 
FUNCTION : Register routes in _sections directory
AUTHOR : RAXO
*/

const api = require("./_api");
const fs = require("fs/promises");
const path = require("path");

async function recursiveRegister(dirPath, scope) {
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
      await recursiveRegister(`${dirPath}/${item}`, scope[item]);
    }
  }
}

const dirPath = path.join(__dirname, "../_sections");
(async () => {
  await recursiveRegister(dirPath, api);

  console.log(api["_user"]["pluginTest"]["entry"]({ body: { flag: "ee" } }, {}));

  // OVERWRITE MANIPULATE
  function entry2(req, res) {
    [req, res] = this.verify(req, res);
    req.body.flag = "HERE " + req.body.flag;
    [req, res] = this.respond(req, res);

    return res.message;
  }

  api._user.pluginTest.setEntrypoint(entry2);

  console.log(api["_user"]["pluginTest"]["entry"]({ body: { flag: "ee" } }, {}));
})();
