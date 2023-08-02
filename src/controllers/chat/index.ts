import type { Response } from 'express';
import { eq } from 'drizzle-orm';
import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

import schema from '../../models/docs';

import type { ConversationChatRequest, Doc } from '../../types';
import { getErrorMessage } from '../../utils';

// todo: this should in the root of the project
import type { VectorStore } from 'langchain/dist/vectorstores/base';
import { OpenAI } from "langchain";
import { ConversationalRetrievalQAChain } from "langchain/chains";

import dotenv from 'dotenv';
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

  async conversationalChat(req: ConversationChatRequest, res: Response) {
    const { body } = req;

    // Get all users from the database.
    const existingDocs = await getExistingDocs(
      process.env.DB_CONTEXT_DOCUMENT || ''
    );

    res.json(existingDocs);
  }
}

export default ChatController;

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

async function getExistingDocs(fileName: string): Promise<Doc[] | []> {
  console.log('fileName', fileName);

  const document = await drizzleDb.query.langChainDocs.findMany({
    where: eq(schema.langChainDocs.name, fileName),
    with: {
      docs: true,
    },
  });

  return document;
}

const CHAIN_PROMPT = `Given the following conversation and a follow up question, 
return the conversation history excerpt that includes any relevant context to 
the question if it exists and rephrase the follow up question to be a standalone question.
Chat History:
{chat_history}
Follow Up Input: {question}
Your answer should follow the following format:
\`\`\`
Use the following pieces of context to answer the users question.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
----------------
<Relevant chat history excerpt as context here>
Standalone question: <Rephrased question here>
\`\`\`
Your useful answer in markup language:`;

async function getChain(vectorStore: VectorStore) {
  const model = new OpenAI({
    temperature: 0, // increase temepreature to get more creative answers
    modelName: 'gpt-3.5-turbo', //change this to gpt-4 if you have access
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  return ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(),
    {
      questionGeneratorChainOptions: { template: CHAIN_PROMPT },
    }
  );
}
