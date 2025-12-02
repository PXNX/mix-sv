import * as server from '../entries/pages/channel/_id_/_page.server.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/channel/_id_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/channel/[id]/+page.server.ts";
export const imports = ["_app/immutable/nodes/3.DhA-SDPM.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/CyB8yewC.js","_app/immutable/chunks/BLthnGt2.js","_app/immutable/chunks/BU9VIPA5.js","_app/immutable/chunks/BBayjIsP.js","_app/immutable/chunks/BUv05TOL.js","_app/immutable/chunks/BoMfLnTK.js"];
export const stylesheets = [];
export const fonts = [];
