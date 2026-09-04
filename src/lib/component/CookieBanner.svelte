<script lang="ts">
	import { CookieManager } from '@boxfish-studio/sveltekit-cookie-manager';
	import type { SKCMConfiguration } from '@boxfish-studio/sveltekit-cookie-manager';

	const configuration: SKCMConfiguration = {
		disclaimer: {
			title: 'This website uses cookies',
			body: 'By using this site, you agree with our use of cookies'
		},
		theme: {
			primary: '#2aabee',
			dark: '#0e1621',
			medium: '#64b5ef',
			light: '#fff'
		}
	};
</script>

<CookieManager {configuration} />
