import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import { getErrorMessage } from "../../utils";
import schema from '../../models/docs';

// todo: this should in the root of the project
import dotenv from 'dotenv';
dotenv.config();

if (
  !process.env.DOCUMENTS_DB_URL ||
  !process.env.DATABASE_URL ||
  !process.env.DB_CONTEXT_DOCUMENT
) {
  throw new Error('DB_URL is not set');
}

const client = new Client({
  connectionString: process.env.DOCUMENTS_DB_URL,
});

const connect = async () => {
  try {
    await client.connect();
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    throw new Error(`error initializing docs db: ${errorMessage}`);
  }
};

connect();

export const drizzleDb = drizzle(client, { schema });
