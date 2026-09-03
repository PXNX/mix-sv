// drizzle.app.config.ts
// Covers app-schema.ts only (mix-sv's own Neon database).
// For the ptb_nn database, see drizzle.config.ts.
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
	schema: './src/lib/server/app-schema.ts',
	out: './drizzle/app',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.APP_DATABASE_URL || 'postgresql://localhost:5432/mix_sv'
	}
});
