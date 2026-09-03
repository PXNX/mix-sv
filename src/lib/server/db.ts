// src/lib/server/db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as appSchema from './app-schema';
import { DATABASE_URL, APP_DATABASE_URL } from '$env/static/private';

// ptb_nn on mn: sources/bloats/destinations/accounts, owned by ptb-nn/tg-nn.
const client = postgres(DATABASE_URL);
export const db = drizzle(client, { schema });

// mix-sv's own Neon database: users/sessions/files/pending_edits/pending_creations.
const appClient = postgres(APP_DATABASE_URL);
export const appDb = drizzle(appClient, { schema: appSchema });
