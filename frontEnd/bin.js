const handler = require('serve-handler');
const http = require('http');
const dotenv = require("dotenv");
dotenv.config();

const server = http.createServer((request, response) => {
  // You pass two more arguments for config and middleware
  // More details here: https://github.com/vercel/serve-handler#options
  return handler(request, response, {
    cleanUrls: true,
    public: "build",
    directoryListing: false,
    redirects: [
        { "source": "!/**/*.@(js|css|png|jpg|otf|txt|gif))", "destination": "/" },
    ]
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log('Running at http://localhost:' + port);
});