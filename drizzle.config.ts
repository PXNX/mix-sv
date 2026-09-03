// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

// Covers schema.ts only (the ptb_nn database, owned by ptb-nn/tg-nn).
// For mix-sv's own database, see drizzle.app.config.ts.
export default defineConfig({
	schema: './src/lib/server/schema.ts',
	out: './drizzle/ptb_nn',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.PTB_NN_DATABASE_URL || 'postgresql://localhost:5432/trainstation'
	}
});
