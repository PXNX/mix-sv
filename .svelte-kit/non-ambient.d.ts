
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/(public)" | "/(authorized)" | "/(admin)" | "/" | "/(public)/about" | "/(public)/auth" | "/(public)/auth/callback" | "/(public)/auth/callback/google" | "/(public)/auth/login" | "/(public)/auth/login/google" | "/(public)/auth/logout" | "/channel" | "/(authorized)/channel" | "/(authorized)/channel/new" | "/channel/[id]" | "/(public)/contact" | "/(admin)/pending" | "/(public)/privacy-policy" | "/(public)/terms-of-service";
		RouteParams(): {
			"/channel/[id]": { id: string }
		};
		LayoutParams(): {
			"/(public)": Record<string, never>;
			"/(authorized)": Record<string, never>;
			"/(admin)": Record<string, never>;
			"/": { id?: string };
			"/(public)/about": Record<string, never>;
			"/(public)/auth": Record<string, never>;
			"/(public)/auth/callback": Record<string, never>;
			"/(public)/auth/callback/google": Record<string, never>;
			"/(public)/auth/login": Record<string, never>;
			"/(public)/auth/login/google": Record<string, never>;
			"/(public)/auth/logout": Record<string, never>;
			"/channel": { id?: string };
			"/(authorized)/channel": Record<string, never>;
			"/(authorized)/channel/new": Record<string, never>;
			"/channel/[id]": { id: string };
			"/(public)/contact": Record<string, never>;
			"/(admin)/pending": Record<string, never>;
			"/(public)/privacy-policy": Record<string, never>;
			"/(public)/terms-of-service": Record<string, never>
		};
		Pathname(): "/" | "/about" | "/about/" | "/auth" | "/auth/" | "/auth/callback" | "/auth/callback/" | "/auth/callback/google" | "/auth/callback/google/" | "/auth/login" | "/auth/login/" | "/auth/login/google" | "/auth/login/google/" | "/auth/logout" | "/auth/logout/" | "/channel" | "/channel/" | "/channel/new" | "/channel/new/" | `/channel/${string}` & {} | `/channel/${string}/` & {} | "/contact" | "/contact/" | "/pending" | "/pending/" | "/privacy-policy" | "/privacy-policy/" | "/terms-of-service" | "/terms-of-service/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/favicon.png" | "/fonts/HPSimplified.ttf" | "/icon-512.png" | "/manifest.json" | string & {};
	}
}