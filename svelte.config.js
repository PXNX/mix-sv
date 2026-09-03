import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	runes: true,
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [
		//...
		vitePreprocess()
		// sveltePreprocessSvg must be used AFTER other markup preprocessors like mdsvex
	],

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		// Bun runtime (rather than the default Node.js one) so that Bun.Image
		// (used for avatar processing, see lib/server/backblaze.ts) is actually
		// available at runtime, not just in local `bun run dev`. Experimental on
		// both Vercel's and adapter-vercel's side as of writing.
		adapter: adapter({ runtime: 'experimental_bun1.x' })
	}
};

export default config;
