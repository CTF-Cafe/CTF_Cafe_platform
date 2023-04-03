/* 
API  MAINFRAME
|_ user                   SECTION
    |_ login              ROUTE
       |_ entry           ENTRYPOINT
          |_ veriy        FUNC 1
          |_ manipulate   FUNC 2
          |_ respond      FUNC 3

verify : Function to verify user data (i.e check body has needed properties)
manipulate : Function to manipulate data (i.e interact with DBs)
respond : Function to generate response sent to the user (i.e set response message)
method : HTTP Method used for the router (i.e GET or POST)
*/

function addRoute(name, verify, manipulate, respond, method) {
  if (this[name]) throw new Error(`Route ${name} already exists!`);
  this[name] = {
    entry(req, res) {
      [req, res] = this.verify(req, res);
      [req, res] = this.manipulate(req, res);
      [req, res] = this.respond(req, res);
      return res.message;
    },
    verify,
    manipulate,
    respond,
    method: method,
    setEntrypoint(newEntry) {
      this.entry = newEntry;
    },
  };
}

function addSection(name) {
  if (this[name]) throw new Error(`Section ${name} already exists!`);
  this[name] = {
    // ADD a Route to Section
    addRoute: addRoute,
    addSection: addSection,
  };
}

const api = {
  // ADD a Route to Root
  addRoute: addRoute,

  // ADD a Section to Root
  addSection: addSection,
};

/* NOTES

Allow infinite nested Sections (recursive)

Maybe allow Route & Section with same name

*/

module.exports = api;
