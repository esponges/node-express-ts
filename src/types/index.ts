import type { Document } from 'langchain/document';
import type { Request } from 'express';

export type Doc = {
  id: string;
  name: string | null;
  createdAt: string | null;
  nameSpace: string | null;
  docs: {
    id: string;
    name: string | null;
    createdAt: string | null;
    metadata: string | null;
    pageContent: string | null;
    langChainDocsId: string | null;
  }[];
};

export type ChatMessage = {
  type: 'apiMessage' | 'userMessage';
  message: string;
  isStreaming?: boolean;
  sourceDocs?: Document[];
};

export type ApiChatResponseBody = {
  response: {
    text: string;
    sourceDocuments: Document[];
  }
};

export type ApiChatResponse = ApiChatResponseBody | { error: string, status: number };

export type ErrorWithMessage = {
  message: string;
};

export interface ConversationChatRequest extends Request {
  body: {
    question: string;
    history: Array<Array<string>>
  }
}

