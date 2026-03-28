
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/private';
 * 
 * console.log(ENVIRONMENT); // => "production"
 * console.log(PUBLIC_BASE_URL); // => throws error during build
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/private' {
	export const DATABASE_URL: string;
	export const TELEGRAM_BOT_TOKEN: string;
	export const OTEL_BSP_SCHEDULE_DELAY: string;
	export const SUDO_GID: string;
	export const LESSOPEN: string;
	export const CODE_SERVER_PORT: string;
	export const PYTHONIOENCODING: string;
	export const MAIL: string;
	export const USER: string;
	export const npm_config_user_agent: string;
	export const GH_TOKEN: string;
	export const npm_node_execpath: string;
	export const SHLVL: string;
	export const OPENAI_BASE_URL: string;
	export const LAST_COMMIT_HASH: string;
	export const APP_DOMAIN: string;
	export const HOME: string;
	export const OTEL_PYTHON_LOG_CORRELATION: string;
	export const OTEL_SERVICE_NAME: string;
	export const OLDPWD: string;
	export const NVM_BIN: string;
	export const npm_package_json: string;
	export const NVM_INC: string;
	export const OTEL_TRACE_CUSTOM_SAMPLER_EXCLUDED_URLS: string;
	export const OPENAI_API_KEY: string;
	export const PS1: string;
	export const PS2: string;
	export const npm_config_engine_strict: string;
	export const RUNTIME_API_HOST: string;
	export const NVM_DIR: string;
	export const SUDO_UID: string;
	export const LOGNAME: string;
	export const pnpm_config_verify_deps_before_run: string;
	export const _: string;
	export const npm_config_registry: string;
	export const TERM: string;
	export const OPENAI_API_BASE: string;
	export const npm_config_node_gyp: string;
	export const PATH: string;
	export const npm_package_name: string;
	export const NODE: string;
	export const npm_config_frozen_lockfile: string;
	export const DEPLOY_WASMER_OWNER: string;
	export const OTEL_TRACES_SAMPLER_RATIO: string;
	export const LANG: string;
	export const OTEL_EXPORTER_OTLP_ENDPOINT: string;
	export const LS_COLORS: string;
	export const npm_lifecycle_script: string;
	export const SUDO_COMMAND: string;
	export const SHELL: string;
	export const npm_package_version: string;
	export const npm_lifecycle_event: string;
	export const npm_config_verify_deps_before_run: string;
	export const NODE_PATH: string;
	export const NEKO_USERNAME: string;
	export const SUDO_USER: string;
	export const LESSCLOSE: string;
	export const npm_config_npm_globalconfig: string;
	export const OTEL_BSP_MAX_EXPORT_BATCH_SIZE: string;
	export const CODE_SERVER_PASSWORD: string;
	export const SENTRY_DSN: string;
	export const PW_TEST_SCREENSHOT_NO_FONTS_READY: string;
	export const npm_config_globalconfig: string;
	export const NEKO_USER_PASSWORD: string;
	export const PWD: string;
	export const OTEL_RESOURCE_ATTRIBUTES: string;
	export const APP_ENV: string;
	export const npm_execpath: string;
	export const GOOGLE_WORKSPACE_CLI_TOKEN: string;
	export const NVM_CD_FLAGS: string;
	export const npm_config__jsr_registry: string;
	export const npm_command: string;
	export const PNPM_SCRIPT_SRC_DIR: string;
	export const NEKO_ADMIN_PASSWORD: string;
	export const TZ: string;
	export const PNPM_HOME: string;
	export const OTEL_TRACES_EXPORTER: string;
	export const CODE_SERVER_DOMAIN: string;
	export const GOOGLE_DRIVE_TOKEN: string;
	export const INIT_CWD: string;
	export const NODE_ENV: string;
}

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/public';
 * 
 * console.log(ENVIRONMENT); // => throws error during build
 * console.log(PUBLIC_BASE_URL); // => "http://site.com"
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * 
 * console.log(env.ENVIRONMENT); // => "production"
 * console.log(env.PUBLIC_BASE_URL); // => undefined
 * ```
 */
declare module '$env/dynamic/private' {
	export const env: {
		DATABASE_URL: string;
		TELEGRAM_BOT_TOKEN: string;
		OTEL_BSP_SCHEDULE_DELAY: string;
		SUDO_GID: string;
		LESSOPEN: string;
		CODE_SERVER_PORT: string;
		PYTHONIOENCODING: string;
		MAIL: string;
		USER: string;
		npm_config_user_agent: string;
		GH_TOKEN: string;
		npm_node_execpath: string;
		SHLVL: string;
		OPENAI_BASE_URL: string;
		LAST_COMMIT_HASH: string;
		APP_DOMAIN: string;
		HOME: string;
		OTEL_PYTHON_LOG_CORRELATION: string;
		OTEL_SERVICE_NAME: string;
		OLDPWD: string;
		NVM_BIN: string;
		npm_package_json: string;
		NVM_INC: string;
		OTEL_TRACE_CUSTOM_SAMPLER_EXCLUDED_URLS: string;
		OPENAI_API_KEY: string;
		PS1: string;
		PS2: string;
		npm_config_engine_strict: string;
		RUNTIME_API_HOST: string;
		NVM_DIR: string;
		SUDO_UID: string;
		LOGNAME: string;
		pnpm_config_verify_deps_before_run: string;
		_: string;
		npm_config_registry: string;
		TERM: string;
		OPENAI_API_BASE: string;
		npm_config_node_gyp: string;
		PATH: string;
		npm_package_name: string;
		NODE: string;
		npm_config_frozen_lockfile: string;
		DEPLOY_WASMER_OWNER: string;
		OTEL_TRACES_SAMPLER_RATIO: string;
		LANG: string;
		OTEL_EXPORTER_OTLP_ENDPOINT: string;
		LS_COLORS: string;
		npm_lifecycle_script: string;
		SUDO_COMMAND: string;
		SHELL: string;
		npm_package_version: string;
		npm_lifecycle_event: string;
		npm_config_verify_deps_before_run: string;
		NODE_PATH: string;
		NEKO_USERNAME: string;
		SUDO_USER: string;
		LESSCLOSE: string;
		npm_config_npm_globalconfig: string;
		OTEL_BSP_MAX_EXPORT_BATCH_SIZE: string;
		CODE_SERVER_PASSWORD: string;
		SENTRY_DSN: string;
		PW_TEST_SCREENSHOT_NO_FONTS_READY: string;
		npm_config_globalconfig: string;
		NEKO_USER_PASSWORD: string;
		PWD: string;
		OTEL_RESOURCE_ATTRIBUTES: string;
		APP_ENV: string;
		npm_execpath: string;
		GOOGLE_WORKSPACE_CLI_TOKEN: string;
		NVM_CD_FLAGS: string;
		npm_config__jsr_registry: string;
		npm_command: string;
		PNPM_SCRIPT_SRC_DIR: string;
		NEKO_ADMIN_PASSWORD: string;
		TZ: string;
		PNPM_HOME: string;
		OTEL_TRACES_EXPORTER: string;
		CODE_SERVER_DOMAIN: string;
		GOOGLE_DRIVE_TOKEN: string;
		INIT_CWD: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://example.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.ENVIRONMENT); // => undefined, not public
 * console.log(env.PUBLIC_BASE_URL); // => "http://example.com"
 * ```
 * 
 * ```
 * 
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
