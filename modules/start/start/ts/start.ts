import * as dotenv from "dotenv";
dotenv.config();

import { listen } from "@beyond-js/backend/listen";

const port = process.env.PORT || 4040;
listen(<number>port);

console.log("start", process.env.OPEN_AI_KEY, port);
