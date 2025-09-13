import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@apollo/server/express4";
import mergedResolvers from "./resolvers/index.js";
import mergedTypeDefs from "./typeDefs/index.js";
import { connectDB } from "./db/connectDB.js";
import dotenv from "dotenv";
import { configurePassport } from "./passport/passport.config.js";
import session from "express-session";
import passport from "passport";
import connectMongodbSession from "connect-mongodb-session";
import { buildContext } from "graphql-passport";
import { fileURLToPath } from "url";

const __dirname = path.resolve();
dotenv.config();
//import job from "./cron.js";

configurePassport();

/**run the job sending GET request to https://expense-tracker.onrender.com)
  every 14 mins to make the application active on render
*/
//job.start();

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs: mergedTypeDefs,
  resolvers: mergedResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
const MongoDBStore = connectMongodbSession(session);

const store = new MongoDBStore({
  uri: process.env.MONGO_URI,

  collection: "sessions",
});

store.on("error", (err) => console.log(err));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, //this option specifies whether to save the session to the store on every request
    saveUninitialized: false, //option specifies whether to save uninitialized sessions
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, //1 week
      httpOnly: true, //this option prevents the Cross-Site Scripting (XSS) attacks
    },
    store: store,
  })
);
app.use(passport.initialize());
app.use(passport.session());

await server.start();
app.use(
  "/graphql",
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  }),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req, res }) =>
      buildContext({
        req,
        res,
      }),
  })
);
/**
 * set to let the application (both frontend and backend ) runs on render.com
 * at the same domain localhost:4000
 */
app.use(express.static(path.join(__dirname, "frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist", "index.html"));
});
await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
await connectDB();
console.log(`Server ready at : http://localhost:4000/graphql`);
