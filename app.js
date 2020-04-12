const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const Nexmo = require("nexmo");
const socketio = require("socket.io");
const chalk = require("chalk");
const PORT = process.env.PORT || 3000;

const nexmo = new Nexmo(
  {
    apiKey: "API_KEY",
    apiSecret: "API_SCERET",
  },
  { debug: true }
);
const app = express();

app.set("view engine", "html");
app.engine("html", ejs.renderFile);
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", (req, res) => {
  const { number, text } = req.body;

  nexmo.message.sendSms(
    "VIRTUAL_NUMBER",
    number,
    text,
    { type: "unicode" },
    (err, responseData) => {
      if (err) {
        console.log(err);
      } else {
        const { messages } = responseData;
        const {
          ["message-id"]: id,
          ["to"]: number,
          ["error-text"]: error,
        } = messages[0];
        console.dir(responseData);
        const data = {
          id,
          number,
          error,
        };

        // Emit to the client
        io.emit("smsStatus", data);
      }
    }
  );
});
const server = app.listen(PORT, () =>
  console.log("App running on port : " + chalk.green(PORT))
);
// socket.io connection
const io = socketio(server);
io.on("connection", (socket) => {
  console.log("Connected");
  io.on("disconnect", () => {
    console.log("Disconnected");
  });
});
