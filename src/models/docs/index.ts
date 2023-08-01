import {
  pgTable,
  serial,
  uniqueIndex,
  varchar,
  timestamp,
  text,
  numeric,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

const projects = pgTable(
  'projects',
  {
    id: serial('id').primaryKey(),
    createdAt: timestamp('created_at'),
    updatedAt: timestamp('updated_at'),
    name: text('name'),
    subheader: text('subheader'),
    description: text('description'),
    url: text('url'),
    tags: text('tags'),
    relevance: numeric('relevance'),
    repoUrl: text('repo_url'),
  },
  (projs) => ({
    nameIndex: uniqueIndex('name_idx').on(projs.name),
  })
);

const langChainDocs = pgTable('LangChainDocs', {
  id: varchar('id').primaryKey(),
  createdAt: text('createdAt'),
  name: text('name'),
  nameSpace: text('nameSpace'),
});

const langChainDocRelations = relations(langChainDocs, ({ many }) => ({
  docs: many(docs),
}));

const docs = pgTable('Docs', {
  id: varchar('id').primaryKey(),
  createdAt: text('createdAt'),
  metadata: text('metadata'),
  pageContent: text('pageContent'),
  name: text('name'),
  langChainDocsId: text('langChainDocsId'),
});

const docsRelations = relations(docs, ({ one }) => ({
  langChainDocs: one(langChainDocs, {
    fields: [docs.langChainDocsId],
    references: [langChainDocs.id],
  }),
}));

export default {
  projects,
  docs,
  langChainDocs,
  docsRelations,
  langChainDocRelations,
};
