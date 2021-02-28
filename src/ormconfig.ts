import { ConnectionOptions } from "typeorm";
import 'dotenv/config';

export const ormConfig: ConnectionOptions = {
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    entities: ["src/entities/*.ts"],
    logging: false,
    synchronize: true
}