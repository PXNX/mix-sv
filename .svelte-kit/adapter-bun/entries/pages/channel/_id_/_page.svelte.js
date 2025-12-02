import { f as attributes, h as head, d as attr_style, a as attr, j as stringify } from "../../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
import { T as Telegram } from "../../../../chunks/telegram.js";
import { T as escape_html } from "../../../../chunks/context.js";
function Arrow_left_24_regular($$renderer, $$props) {
  const { $$slots, $$events, ...p } = $$props;
  $$renderer.push(`<svg${attributes(
    {
      viewBox: "0 0 24 24",
      mode: "url",
      width: "1.2em",
      height: "1.2em",
      ...p
    },
    void 0,
    void 0,
    void 0,
    3
  )}><path fill="currentColor" d="M10.733 19.79a.75.75 0 0 0 1.034-1.086L5.516 12.75H20.25a.75.75 0 0 0 0-1.5H5.516l6.251-5.955a.75.75 0 0 0-1.034-1.086l-7.42 7.067a1 1 0 0 0-.3.58a.8.8 0 0 0 .001.289a1 1 0 0 0 .3.579z"></path></svg>`);
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const { channel } = data;
    head($$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html(channel.channel_name)} - Channel Details</title>`);
      });
      $$renderer3.push(`<meta name="description"${attr("content", `Details for ${stringify(channel.channel_name)} Telegram channel`)}/> <meta name="view-transition" content="same-origin"/>`);
    });
    $$renderer2.push(`<div class="mb-8"><button class="group inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/50 hover:bg-white/20">`);
    Arrow_left_24_regular($$renderer2, {
      class: "h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1"
    });
    $$renderer2.push(`<!----> <span class="font-semibold">Back to Search</span></button></div> <div class="card mb-8 overflow-hidden border border-white/30 bg-white/10 backdrop-blur-md"${attr_style(`view-transition-name: channel-${stringify(channel.channel_id)}`)}><div class="card-body p-8"><div class="flex flex-col items-center gap-6 text-center"><div class="flex-shrink-0"${attr_style(`view-transition-name: avatar-${stringify(channel.channel_id)}`)}><div class="avatar"><div class="h-32 w-32 rounded-3xl ring-4 ring-white/40 ring-offset-4 ring-offset-transparent"><img${attr("src", channel.avatar)} alt="Channel Avatar" class="object-cover"/></div></div></div> <div class="space-y-4"><h1 class="bg-gradient-to-r from-white via-pink-100 to-blue-100 bg-clip-text text-4xl font-bold text-white">${escape_html(channel.channel_name)}</h1> `);
    if (channel.username) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="flex items-center justify-center gap-2 text-lg text-white/80">@${escape_html(channel.username)}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (channel.bias) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="inline-block rounded-2xl border border-white/40 bg-white/20 px-6 py-3 text-3xl tracking-wide backdrop-blur-sm">${escape_html(channel.bias)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div></div> <div class="pointer-events-none absolute inset-0 bg-gradient-to-r from-pink-500/10 to-blue-500/10 opacity-50"></div></div> <div class="space-y-4">`);
    if (channel.username) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<a${attr("href", `https://t.me/${channel.username}`)} target="_blank" rel="noopener noreferrer" class="btn btn-lg w-full border-none bg-gradient-to-r from-pink-500 to-purple-600 text-white transition-all duration-300 hover:scale-105 hover:from-pink-600 hover:to-purple-700">`);
      Telegram($$renderer2, { class: "size-6" });
      $$renderer2.push(`<!----> Open in Telegram</a>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (channel.invite) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<a${attr("href", `https://t.me/+${channel.invite}`)} target="_blank" rel="noopener noreferrer" class="btn btn-lg w-full border-none bg-gradient-to-r from-blue-500 to-teal-600 text-white transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-teal-700">`);
        Telegram($$renderer2, { class: "size-6" });
        $$renderer2.push(`<!----> Join Channel</a>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="btn btn-lg btn-disabled w-full border-white/20 bg-white/10 text-white/50">`);
        Telegram($$renderer2, { class: "size-6" });
        $$renderer2.push(`<!----> Channel Not Available</div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
