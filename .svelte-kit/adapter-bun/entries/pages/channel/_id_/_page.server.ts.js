import { g as getChannelById } from "../../../../chunks/db.js";
import { error } from "@sveltejs/kit";
const load = async ({ params }) => {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    throw error(400, "Invalid channel ID");
  }
  const channel = await getChannelById(id);
  if (!channel) {
    throw error(404, "Channel not found");
  }
  return {
    channel
  };
};
export {
  load
};
