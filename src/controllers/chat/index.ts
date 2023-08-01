import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import schema from '../../models/docs';

import type { Doc } from '../../types';
import { getErrorMessage } from '../../utils';

// todo: this should in the root of the project
import dotenv from "dotenv";
dotenv.config();

class ChatController {
  private static instance: ChatController | undefined;

  constructor() {}

  static getInstance() {
    if (!ChatController.instance) {
      ChatController.instance = new ChatController();
    }
    return ChatController.instance;
  }

  async conversationalChat(req: Request, res: Response) {
    // Get all users from the database.
    res.send('here the chat');
  }
}

export default ChatController;

if (!process.env.DOCUMENTS_DB_URL) {
  throw new Error("DB_URL is not set");
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

async function getExistingDocs (fileName: string): Promise<Doc[] | []> {
  const document = await drizzleDb.query.langChainDocs.findMany({
    where: eq(schema.langChainDocs.name, fileName),
    with: {
      docs: true,
    },
  });

  return document;
}
