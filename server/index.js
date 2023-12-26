import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose"
import { defineAuthenticationEndpoints } from './authenticationEndpoints.js';
import { defineChatEndpoints } from './chatEndpoints.js';
import { defineMembershipEndpoints } from './membershipEndpoints.js';
import { defineSocketLogic } from './socketLogic.js';
import dbUrl from './secretKey.js';

const PORT = process.env.PORT || 8000
var databaseUrl = process.env.MONGODB_CONNECT_URI;
const app = express();

app.use(express.json())
// app.use(bodyParser.urlencoded({extended:false}))

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3006", "http://localhost:3007"]
  }
});


defineSocketLogic(io);
defineAuthenticationEndpoints(app);
defineChatEndpoints(io, app);
defineMembershipEndpoints(io, app);

mongoose.connect(databaseUrl).catch((err) => {
  console.log("catching the error ......")
  console.log(err)
});


httpServer.listen(PORT, () => {

});



