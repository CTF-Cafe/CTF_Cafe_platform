exports.init = async function (api) {
  // set endpoint entry
  api._user.pluginTest.setEntrypoint(entrypoint);
}

async function entrypoint(req, res) {
  [req, res] = this.verify(req, res);
  [req, res] = this.manipulate(req, res);

  res.message = {
    state: "success",
    message: "Success! Hello World!",
  };

  return req, res;
};