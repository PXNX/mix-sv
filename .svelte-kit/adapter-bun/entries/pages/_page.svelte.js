import { f as attributes, c as store_get, h as head, a as attr, g as ensure_array_like, d as attr_style, j as stringify, u as unsubscribe_stores } from "../../chunks/index2.js";
import { p as page } from "../../chunks/stores.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
import { T as Telegram } from "../../chunks/telegram.js";
import { T as escape_html } from "../../chunks/context.js";
function Arrow_right_24_regular($$renderer, $$props) {
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
  )}><path fill="currentColor" d="M13.267 4.209a.75.75 0 0 0-1.034 1.086l6.251 5.955H3.75a.75.75 0 0 0 0 1.5h14.734l-6.251 5.954a.75.75 0 0 0 1.034 1.087l7.42-7.067a1 1 0 0 0 .3-.58a.8.8 0 0 0-.001-.29a1 1 0 0 0-.3-.578z"></path></svg>`);
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const BIAS_OPTIONS = [
      { value: "🇺🇦", label: "Ukraine" },
      { value: "🇷🇺", label: "Russia" },
      { value: "🇬🇧", label: "United Kingdom" },
      { value: "🇯🇵", label: "Japan" },
      { value: "🇨🇦", label: "Canada" }
    ];
    let { data, form } = $$props;
    let searchTerm = store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("name") || "";
    let selectedBias = store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("bias") || "";
    let searchResults = data.channels || [];
    let loading = false;
    const showEmptyState = searchResults.length === 0 && (searchTerm || selectedBias);
    head($$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Telegram Channel Search</title>`);
      });
      $$renderer3.push(`<meta name="description" content="Search for Telegram channels by name and region"/> <meta name="view-transition" content="same-origin"/>`);
    });
    $$renderer2.push(`<header class="mb-10 text-center"><h1 class="mb-4 text-2xl font-bold text-white">Telegram Channel Search</h1> <a href="https://t.me/nyx_news" target="_blank" rel="noopener noreferrer" class="group inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-5 py-2 text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/30">`);
    Telegram($$renderer2, {
      class: "h-5 w-5 transition-transform duration-200 group-hover:scale-110"
    });
    $$renderer2.push(`<!----> <span class="font-semibold">NewsMix</span></a></header> <div class="card mb-6 border border-white/30 bg-white/10 backdrop-blur-md"><div class="card-body p-4 md:p-6"><form method="POST" action="?/search" class="space-y-4 md:space-y-6"><input id="channel-name" type="text" name="name" placeholder="Search channels..." class="input w-full rounded-xl border border-white/40 bg-white/10 px-4 py-3 text-white placeholder-white/60 backdrop-blur-sm transition-all duration-200 focus:border-pink-200 focus:bg-white/30"${attr("value", searchTerm)}${attr("disabled", loading, true)}/> `);
    $$renderer2.select(
      {
        id: "bias-select",
        name: "bias",
        class: "select w-full rounded-xl border border-white/40 bg-white/10 px-4 py-3 text-white backdrop-blur-sm transition-all duration-200 focus:border-pink-200 focus:bg-white/30",
        value: selectedBias,
        disabled: loading
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "", class: "bg-white/10 text-white" }, ($$renderer4) => {
          $$renderer4.push(`🌐 Ignore Bias`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(BIAS_OPTIONS);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let option = each_array[$$index];
          $$renderer3.option({ value: option.value, class: "bg-white/10 text-white" }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(option.value)}
						${escape_html(option.label)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(` <div class="flex"><button type="submit" class="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-pink-300 hover:to-blue-300 md:ml-auto md:w-auto"${attr("disabled", loading, true)}><span class="text-lg">Search</span> `);
    Arrow_right_24_regular($$renderer2, { class: "h-6 w-6" });
    $$renderer2.push(`<!----></button></div></form></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="space-y-4"><!--[-->`);
      const each_array_1 = ensure_array_like(searchResults);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let channel = each_array_1[$$index_1];
        $$renderer2.push(`<a${attr("href", `/channel/${channel.channel_id}`)} class="card group overflow-hidden border border-white/30 bg-white/10 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-white/50 hover:bg-white/20"${attr_style(`view-transition-name: channel-${stringify(channel.channel_id)}`)}><div class="card-body p-4"><div class="flex items-center gap-6"><div class="flex-shrink-0"${attr_style(`view-transition-name: avatar-${stringify(channel.channel_id)}`)}><div class="avatar"><div class="size-20 rounded-full ring-4 ring-white/40 ring-offset-4 ring-offset-transparent transition-all duration-300 group-hover:ring-white/60"><img${attr("src", channel.avatar)}${attr("alt", channel.channel_name)} class="object-cover" loading="lazy"/></div></div></div> <div class="flex-grow gap-1"><h3 class="ellipsis truncate text-lg font-bold text-white transition-colors duration-200 group-hover:text-pink-100">${escape_html(channel.channel_name)}</h3> `);
        if (channel.username) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<p class="flex items-center gap-2 text-base text-white/70 transition-colors duration-200 group-hover:text-white/90">@${escape_html(channel.username)}</p>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div> <div class="flex flex-shrink-0 items-center gap-6 tracking-wide">`);
        if (channel.bias) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="rounded-lg border border-white/40 bg-white/20 px-2 py-1 text-xl tracking-wide backdrop-blur-sm transition-all duration-300 group-hover:border-white/60 group-hover:bg-white/30">${escape_html(channel.bias)}</div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> `);
        Arrow_right_24_regular($$renderer2, {
          class: "size-8 text-white/60 transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110 group-hover:text-white"
        });
        $$renderer2.push(`<!----></div></div></div></a>`);
      }
      $$renderer2.push(`<!--]--> `);
      if (showEmptyState) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="card border border-white/30 bg-white/10 backdrop-blur-md"><div class="card-body py-20 text-center"><div class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"><svg class="h-12 w-12 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></div> <h3 class="mb-3 text-2xl font-bold text-white">No channels found</h3> <p class="text-lg text-white/70">Try adjusting your search criteria or explore different regions</p></div></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
