/*
FUNCTION : Register plugins to api
AUTHOR : RAXO
*/

// FUNCTIONAL IMPORTS
const registerRoutes = require("./_mainframe/registerRoutes");
const registerPlugins = require("./_plugins/registerPlugins");
const api = require("./_mainframe/api");

(async () => {

    await registerRoutes();
    await registerPlugins();

    console.log(api);

})()