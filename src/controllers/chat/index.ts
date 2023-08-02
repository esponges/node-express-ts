import type { Response } from 'express';
import { eq } from 'drizzle-orm';

import { OpenAI } from "langchain";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { Document } from 'langchain/document';

import type { ConversationChatRequest, Doc } from '../../types';
import type { VectorStore } from 'langchain/dist/vectorstores/base';

import { getErrorMessage } from '../../utils';
import schema from '../../models/docs';
import { drizzleDb } from '../../models/drizzle';

// todo: this should in the root of the project
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
    const { history, question } = body;

    // Get all users from the database.
    try {
      const store = await getVectorStore();
      const chain = await getChain(store);

      const chatHistoryAsString = history.map((msg) => msg.join("\n")).join("\n");

      const response = await chain.call({
        question: question,
        // not working?
        // apparently fixed here https://github.com/nearform/langchainjs/commit/a8be68df562c7e7d2bfce5a9b2fa933a06bf616f
        // also works on scripts/chain.ts but not here, why?
        chat_history: chatHistoryAsString,
      });
      
      res.json(response);
    } catch (error) {
      const msg = getErrorMessage(error);

      res.status(500).json({ error: msg });
    }

  }
}

export default ChatController;

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

async function getVectorStore() {
  if (!process.env.DB_CONTEXT_DOCUMENT) {
    throw new Error("DB_CONTEXT_DOCUMENT is not set");
  }

  const docs = await getExistingDocs(process.env.DB_CONTEXT_DOCUMENT);

  if (!docs[0]?.docs.length) {
    throw new Error("An error occurred while fetching documents");
  }

  const documents = docs[0].docs.map(
    (doc) =>
      new Document<Doc>({
        metadata: JSON.parse(doc.metadata as string),
        pageContent: doc.pageContent as string,
      })
  );

  // const texts = docs[0].docs.map((doc) => doc.pageContent as string);
  // const textsMetas = docs[0].docs.map((doc) => !!doc?.metadata ? JSON.parse(doc.metadata ) : {});
  // const HNSWStore = await HNSWLib.fromTexts(texts, textsMetas, new OpenAIEmbeddings());
  const HNSWStore = await HNSWLib.fromDocuments(documents, new OpenAIEmbeddings());

  return HNSWStore;
}
