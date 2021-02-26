import "reflect-metadata";
import { createConnection, getConnection } from "typeorm";
import express from "express";
import { User } from "./entities/User";

const app = express();
const port = 3000;

app.use(express.json());

app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});

app.options("*",async (req,res)=>{
    res.setHeader("access-control-allow-origin","*");
    res.status(204).send();
    console.log("handle options")
})

app.post("/", async (req, res) => {
  try {
    const db = getConnection();
    const user = db.manager.create(User, req.body);
    const reso = await db.manager.save(user);
    const users = await db.manager.find(User);
    console.log(users);
    res.send(reso);
  } catch (e) {res.status(400).send(e.message)}
});

console.log("x > w");
async function init() {
  await createConnection({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "dhraltan",
    password: "Gheorghe_1998",
    database: "api",
    entities: [__dirname + "/entities/*.ts"],
    synchronize: true,
    logging: false,
  });

  await app.listen(port);
}

init().then(() => {
  console.log(`Server is listening to port: ${port}`);
});
