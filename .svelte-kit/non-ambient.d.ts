
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
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/(public)" | "/(authorized)" | "/(admin)" | "/" | "/(public)/about" | "/(public)/api" | "/(authorized)/api" | "/(authorized)/api/avatar" | "/(authorized)/api/avatar/[key]" | "/(public)/api/favorites" | "/(public)/auth" | "/(public)/auth/callback" | "/(public)/auth/callback/google" | "/(public)/auth/callback/telegram" | "/(public)/auth/login" | "/(public)/auth/login/google" | "/(public)/auth/logout" | "/(public)/auth/webapp" | "/channel" | "/(authorized)/channel" | "/(authorized)/channel/new" | "/channel/[id]" | "/(authorized)/channel/[id]" | "/(authorized)/channel/[id]/edit" | "/(public)/contact" | "/(public)/favorites" | "/(admin)/pending" | "/(public)/privacy-policy" | "/(authorized)/submissions" | "/(public)/terms-of-service" | "/(public)/webapp";
		RouteParams(): {
			"/(authorized)/api/avatar/[key]": { key: string };
			"/channel/[id]": { id: string };
			"/(authorized)/channel/[id]": { id: string };
			"/(authorized)/channel/[id]/edit": { id: string }
		};
		LayoutParams(): {
			"/(public)": Record<string, never>;
			"/(authorized)": { key?: string | undefined; id?: string | undefined };
			"/(admin)": Record<string, never>;
			"/": { key?: string | undefined; id?: string | undefined };
			"/(public)/about": Record<string, never>;
			"/(public)/api": Record<string, never>;
			"/(authorized)/api": { key?: string | undefined };
			"/(authorized)/api/avatar": { key?: string | undefined };
			"/(authorized)/api/avatar/[key]": { key: string };
			"/(public)/api/favorites": Record<string, never>;
			"/(public)/auth": Record<string, never>;
			"/(public)/auth/callback": Record<string, never>;
			"/(public)/auth/callback/google": Record<string, never>;
			"/(public)/auth/callback/telegram": Record<string, never>;
			"/(public)/auth/login": Record<string, never>;
			"/(public)/auth/login/google": Record<string, never>;
			"/(public)/auth/logout": Record<string, never>;
			"/(public)/auth/webapp": Record<string, never>;
			"/channel": { id?: string | undefined };
			"/(authorized)/channel": { id?: string | undefined };
			"/(authorized)/channel/new": Record<string, never>;
			"/channel/[id]": { id: string };
			"/(authorized)/channel/[id]": { id: string };
			"/(authorized)/channel/[id]/edit": { id: string };
			"/(public)/contact": Record<string, never>;
			"/(public)/favorites": Record<string, never>;
			"/(admin)/pending": Record<string, never>;
			"/(public)/privacy-policy": Record<string, never>;
			"/(authorized)/submissions": Record<string, never>;
			"/(public)/terms-of-service": Record<string, never>;
			"/(public)/webapp": Record<string, never>
		};
		Pathname(): "/" | "/about" | `/api/avatar/${string}` & {} | "/api/favorites" | "/auth/callback/google" | "/auth/callback/telegram" | "/auth/login" | "/auth/login/google" | "/auth/logout" | "/auth/webapp" | "/channel/new" | `/channel/${string}` & {} | `/channel/${string}/edit` & {} | "/contact" | "/favorites" | "/pending" | "/privacy-policy" | "/submissions" | "/terms-of-service" | "/webapp";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/favicon.png" | "/fonts/HPSimplified.ttf" | "/icon-512.png" | "/manifest.json" | string & {};
	}
}