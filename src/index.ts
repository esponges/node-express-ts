import express from "express";
import type { Express } from "express";

import router from "./routes";

const app: Express = express();
const port = 8000;

// parse application/json
app.use(express.json());
app.use('/api', router);

app.listen(port, () => {
  console.log(`now listening on port ${port}`);
});
