import { s as searchChannels } from "../../chunks/db.js";
const load = async ({ url }) => {
  const name = url.searchParams.get("name") || void 0;
  const bias = url.searchParams.get("bias") || void 0;
  const channels = await searchChannels(name, bias);
  return {
    channels
  };
};
const actions = {
  search: async ({ request }) => {
    const data = await request.formData();
    const name = data.get("name")?.toString() || void 0;
    const bias = data.get("bias")?.toString() || void 0;
    try {
      const channels = await searchChannels(name, bias);
      return {
        success: true,
        channels
      };
    } catch (error) {
      console.error("Search failed:", error);
      return {
        success: false,
        channels: [],
        error: "Search failed. Please try again."
      };
    }
  }
};
export {
  actions,
  load
};
