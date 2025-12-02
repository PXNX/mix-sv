import * as server from '../entries/pages/_page.server.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.ts";
export const imports = ["_app/immutable/nodes/2.B1LUBBQN.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/CyB8yewC.js","_app/immutable/chunks/BLthnGt2.js","_app/immutable/chunks/BU9VIPA5.js","_app/immutable/chunks/BBayjIsP.js","_app/immutable/chunks/Byh2cX1s.js","_app/immutable/chunks/BUv05TOL.js","_app/immutable/chunks/BoMfLnTK.js"];
export const stylesheets = [];
export const fonts = [];
