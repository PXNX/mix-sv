import { sql } from "bun";
async function searchChannels(channel_name, bias) {
  try {
    let query = sql`
            SELECT channel_id, channel_name, username, bias, invite
            FROM sources
            WHERE 1=1
        `;
    if (channel_name && bias) {
      query = sql`
                SELECT channel_id, channel_name, username, bias,  invite
                FROM sources
                WHERE channel_name ILIKE ${"%" + channel_name + "%"}
                AND bias = ${bias}
                ORDER BY channel_name
            `;
    } else if (channel_name) {
      query = sql`
                SELECT channel_id, channel_name, username, bias,  invite
                FROM sources
                WHERE channel_name ILIKE ${"%" + channel_name + "%"} 
                ORDER BY channel_name
            `;
    } else if (bias) {
      query = sql`
                SELECT channel_id, channel_name, username, bias,  invite
                FROM sources
                WHERE bias = ${bias}
                ORDER BY channel_name
            `;
    } else {
      query = sql`
                SELECT channel_id, channel_name, username, bias,  invite 
                FROM sources
                ORDER BY channel_name
            `;
    }
    const sources = await query;
    return sources;
  } catch (error) {
    console.error("Error searching sources:", error);
    throw new Error("Failed to search sources");
  }
}
async function getChannelById(channel_id) {
  try {
    const result = await sql`
            SELECT channel_id, channel_name, username, bias,  invite
            FROM sources
            WHERE channel_id = ${channel_id}
        `;
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching channel by ID:", error);
    throw new Error("Failed to fetch channel");
  }
}
export {
  getChannelById as g,
  searchChannels as s
};
