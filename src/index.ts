import express from "express";
import type { Express } from "express";
import router from "./routes";
const port = 8000;

const app: Express = express();

app.use('/api', router);

app.listen(port, () => {
  console.log(`now listening on port ${port}`);
});
