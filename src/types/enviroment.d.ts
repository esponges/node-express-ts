declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      DOCUMENTS_DB_URL: string;
      DB_CONTEXT_DOCUMENT: string;
      OPENAI_API_KEY: string;
    }
  }
}

export {};
