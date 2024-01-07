import express from "express";
import config from "./utils/config";
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
import sequelize from "./utils/sequelize";
import Request from "./models/request";
import generatePath from "./utils/idGenerator";
import PgBin from "./models/pgbin";
// import path
import path from "path";

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection to PostgreSQL has been established successfully.");
    return PgBin.sync({ alter: true });
  })
  .then(() => {
    console.log("All PostgreSQL tables have been successfully created.");
  })
  .catch((error) => {
    console.error("Unable to connect to PostgreSQL:", error);
  });

app.use(cors());
app.use(express.static("build"));
app.use(express.json());

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error: Error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

app.get("/", (_, res) => {
  res.send("this might be working");
});

// GET /api/bins/ -- Get all bins information //
app.get("/api/bins", async (req, res) => {
  // this is working
  const bins = await PgBin.findAll();
  res.json(bins.map((bin) => bin.toJSON()));
});

// POST /api/bins/ -- Create new bin //
app.post("/api/bins", async (req, res) => {
  // this is working
  const binPath = generatePath();
  const bin = new PgBin({ binPath });
  await bin.save();
  res.json(bin.toJSON());
});

// GET /api/bins/:binPath -- retrieve bin by path, with associated requests //
app.get("/api/bins/:binPath", async (req, res) => {
  // this is working
  const bin = await PgBin.findOne({ where: { binPath: req.params.binPath } });
  res.json(bin);
});

// DELETE /api/bins/:binPath -- delete a bin
app.delete("/api/bins/:binPath", async (req, res) => {
  // this is working
  await PgBin.destroy({ where: { binPath: req.params.binPath } });
  res.status(204).end();
});

// ALL /api/bins/:binPath/incoming -- capture http/webhook at endpoint
app.all("/api/bins/:binPath/incoming", async (req, res) => {
  const binPath = req.params.binPath;

  // Make sure there is a bin:
  const pgLookupAttempt = await PgBin.findOne({ where: { binPath: binPath } });
  if (!pgLookupAttempt) {
    res.status(404).send("No such bin");
  }

  // Create a submission for mongoDB for the request to the endpoint:
  const newRequestObj = {
    binPath: req.params.binPath,
    event: {
      client_ip: req.ip,
      method: req.method,
      url: req.url,
      path: req.path,
      headers: req.headers,
      body: req.body,
      query: req.query,
      protocol_version: req.httpVersion,
      // tls_info: (req.connection as tls.TLSSocket).getPeerCertificate(),
    },
    // payload: JSON.stringify(req),
  };

  const newRequest = new Request(newRequestObj);
  await newRequest.save();

  if (clients[binPath]) {
    clients[binPath].forEach((client) => {
      client.write(`data: ${JSON.stringify(newRequest.toJSON())}\n\n`);
    });
  }

  // Update the bin's lastRequest property:
  if (pgLookupAttempt) {
    await pgLookupAttempt.update({ lastRequest: new Date() });
  }

  res.json(newRequestObj);
});

// GET /api/bins/:binPath/requests -- retrieve all requests associated with a bin
app.get("/api/bins/:binPath/requests", async (req, res) => {
  const binPath = req.params.binPath;
  try {
    const pgLookupAttempt = await PgBin.findOne({
      where: { binPath: binPath },
    });

    if (!pgLookupAttempt) {
      return res.status(404).send("No such bin");
    }

    const requestObjects = await Request.find({ binPath });
    return res.json(requestObjects.map((reqObj) => reqObj.toJSON()));
  } catch (error) {
    console.error(`Error retrieving request for binPath ${binPath} ${error}`);
    res.status(500).send(`Something bad happened`);
  }
});

// GET /api/bins/:binPath/requests/:reqId -- retrieve a specific request
app.get("/api/bins/:binPath/requests/:reqId", async (req, res) => {
  const binPath = req.params.binPath;
  const reqId = req.params.reqId;
  try {
    const requestObject = await Request.findOne({
      _id: reqId,
      binPath: binPath,
    });
    if (requestObject) {
      res.json(requestObject.toJSON());
    } else {
      res.status(404).send("No such request");
    }
  } catch (error) {
    console.error(`Error retrieving request for request ${reqId} ${error}`);
    res.status(500).send(`Something bad happened`);
  }
});

// DELETE /api/bins/:binPath/requests/:reqId -- delete a specific request
app.delete("/api/bins/:binPath/requests/:reqId", async (req, res) => {
  const binPath = req.params.binPath;
  const reqId = req.params.reqId;
  if (!mongoose.Types.ObjectId.isValid(reqId)) {
    return res.status(400).send("Invalid Object ID");
  }

  try {
    const deletedRequest = await Request.findByIdAndRemove(reqId);
    if (!deletedRequest) {
      return res.status(404).send("No such request");
    } else {
      return res.status(204).end();
    }
  } catch (error) {
    console.error(`Error retrieving request for request ${reqId} ${error}`);
    return res.status(500).send(`Something bad happened`);
  }
});

let clients: { [key: string]: express.Response[] } = {};
// SSE
app.get(
  "/api/bins/:binPath/events",
  async (req: express.Request, res: express.Response) => {
    const binPath = req.params.binPath;

    console.log(`Client connected to /api/bins/${binPath}/events`);
    // Initialize if not already done
    if (!clients[binPath]) {
      clients[binPath] = [];
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Add this client to the list of clients interested in this binId
    clients[binPath].push(res);

    // If a client disconnects, remove it from the list of clients interested in this binId
    req.on("close", () => {
      clients[binPath] = clients[binPath].filter((client) => client !== res);
    });
  }
);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build/index.html"));
});

// Start server:
app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
