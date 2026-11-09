// Production entry point for cPanel's Node.js application manager.
const { createServer } = require("node:http");

process.env.NODE_ENV = "production";
process.chdir(__dirname);

const next = require("next");
const port = Number(process.env.PORT || 3000);
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res).catch((error) => {
      console.error("Request failed:", error);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end("Internal server error");
      } else {
        res.destroy();
      }
    });
  });
  server.on("error", (error) => {
    console.error("Server failed:", error);
    process.exit(1);
  });
  // Passenger intercepts listen() and manages the public socket on cPanel.
  server.listen(port);
}).catch((error) => {
  console.error("Could not start Next.js. Install dependencies and run npm run build first.", error);
  process.exit(1);
});
