const express = require("express");
const router = require("./src/index");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const colors = require("colors");
require("dotenv").config();

app.use(cors());
app.use(
  express.json({
    limit: "5mb",
  })
);
app.use(
  express.urlencoded({
    limit: "5mb",
    extended: false,
  })
);

app.get("/", (_, response) => {
  response.send("my-condition-app api start!");
  response.end();
});

app.use("/", router);
app.use(morgan("dev"));
app.set("port", 3002);

app.listen(app.get("port"), () => {
  console.log(`Server Open: http://localhost:${app.get("port")}`.magenta);
});
