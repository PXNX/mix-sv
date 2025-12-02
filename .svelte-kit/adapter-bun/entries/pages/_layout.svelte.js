import "clsx";
import { g as get, d as derived, w as writable } from "../../chunks/index.js";
import { a as attr, s as slot, b as bind_props, c as store_get, u as unsubscribe_stores, d as attr_style } from "../../chunks/index2.js";
import { p as page } from "../../chunks/stores.js";
import { f as fallback } from "../../chunks/utils.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
import { T as escape_html } from "../../chunks/context.js";
const COOKIE_EXPIRATION_DAYS = 30;
const COOKIE_NAME_PREFIX = "skcm-";
const DEFAULT_DISCLAIMER_CONFIG = {
  body: "By using this site, you agree with our use of cookies.",
  policyText: "Read our Cookie Policy",
  policyUrl: "/privacy-policy",
  acceptButtonText: "Accept all",
  rejectButtonText: "Reject all"
};
const DEFAULT_THEME_COLORS = {
  primary: "#14cabf",
  dark: "#131f37",
  medium: "#b0bfd9",
  light: "#fff"
};
var CookieCategory;
(function(CookieCategory2) {
  CookieCategory2["Functionality"] = "Functionality";
  CookieCategory2["Statistics"] = "Statistics";
  CookieCategory2["Marketing"] = "Marketing";
  CookieCategory2["Advertising"] = "Advertising";
})(CookieCategory || (CookieCategory = {}));
var CookieType;
(function(CookieType2) {
  CookieType2["HTTP"] = "HTTP";
})(CookieType || (CookieType = {}));
const SKCM_GA_GOOGLE_ANALYTICS_UNIVERSAL_COOKIE = {
  name: `${COOKIE_NAME_PREFIX}-ga-universal`,
  type: CookieType.HTTP
};
const SKCM_GA_GOOGLE_ANALYTICS_4_COOKIE = {
  name: `${COOKIE_NAME_PREFIX}-ga-4`,
  type: CookieType.HTTP
};
({
  category: CookieCategory.Statistics,
  type: CookieType.HTTP
});
({
  category: CookieCategory.Marketing,
  type: CookieType.HTTP
});
({
  category: CookieCategory.Functionality,
  type: CookieType.HTTP
});
({
  category: CookieCategory.Functionality,
  type: CookieType.HTTP
});
({
  category: CookieCategory.Statistics,
  type: CookieType.HTTP
});
({
  category: CookieCategory.Advertising,
  type: CookieType.HTTP
});
({
  category: CookieCategory.Statistics,
  type: CookieType.HTTP
});
({
  category: CookieCategory.Statistics,
  type: CookieType.HTTP
});
({
  category: CookieCategory.Functionality,
  type: CookieType.HTTP
});
({
  category: CookieCategory.Advertising,
  type: CookieType.HTTP
});
var SupportedService;
(function(SupportedService2) {
  SupportedService2["GoogleAnalyticsUniversal"] = "googleAnalyticsUniversal";
  SupportedService2["GoogleAnalytics4"] = "googleAnalytics4";
  SupportedService2["CustomCookie"] = "customNecessaryCookies";
})(SupportedService || (SupportedService = {}));
const setCookie = (name, val, expDays) => {
  const date = /* @__PURE__ */ new Date();
  const value = val;
  date.setTime(date.getTime() + expDays * 24 * 60 * 60 * 1e3);
  document.cookie = name + "=" + value + "; expires=" + date.toUTCString() + "; path=/";
};
const submitNecessaryCookies = (value) => {
  const SKCM_NECESSARY_COOKIES = [
    SKCM_GA_GOOGLE_ANALYTICS_UNIVERSAL_COOKIE?.name,
    SKCM_GA_GOOGLE_ANALYTICS_4_COOKIE?.name
  ];
  const neededCookies = get(necessaryCookies)?.filter((cookie) => cookie?.showDisclaimerIfMissing && SKCM_NECESSARY_COOKIES.includes(cookie?.name)) ?? [];
  for (let i = 0; i < neededCookies?.length; i++) {
    setCookie(neededCookies[i]?.name, value, COOKIE_EXPIRATION_DAYS);
  }
  const _configuredServices = get(configuredServices)?.map((service) => ({
    ...service,
    enabled: value === "true"
  }));
  configuredServices.set(_configuredServices);
};
const isServiceEnabled = (serviceType) => {
  const serviceConfig = get(configuredServices)?.find(({ type }) => type === serviceType);
  return serviceConfig?.enabled;
};
const formatStyles = (theme) => Object.entries(theme).map((colorVariable) => `--${colorVariable[0]}:${colorVariable[1]};`).join(" ");
const getInlineStyle = (theme = {}) => {
  const mergedTheme = { ...DEFAULT_THEME_COLORS, ...theme };
  return formatStyles(mergedTheme);
};
const showCookieDisclaimer = writable(false);
const configuredServices = writable([]);
const servicesInitialized = writable(false);
const necessaryCookies = writable([]);
derived(configuredServices, ($configuredServices) => $configuredServices.reduce((accumulator, service) => {
  const cookiesName = accumulator.map((cookie) => cookie.name);
  const serviceCookies = service.cookies.filter((cookie) => !cookiesName.includes(cookie.name));
  return accumulator.concat(serviceCookies);
}, []));
const initializeServices = () => {
  if (!get(servicesInitialized)) {
    const googleAnalyticsUniversalConfig = get(configuredServices)?.find(({ type }) => type === SupportedService.GoogleAnalyticsUniversal);
    const googleAnalytics4Config = get(configuredServices)?.find(({ type }) => type === SupportedService.GoogleAnalytics4);
    if (googleAnalyticsUniversalConfig?.enabled) {
      loadGoogleAnalytics(googleAnalyticsUniversalConfig.id);
    } else {
      if (googleAnalytics4Config?.enabled) {
        loadGoogleAnalytics(googleAnalytics4Config.id);
      }
    }
  }
};
const loadGoogleAnalytics = (id) => {
};
const updatePathGA = (id, path) => {
};
function Button($$renderer, $$props) {
  let onClick = fallback($$props["onClick"], () => {
  });
  let id = fallback($$props["id"], void 0);
  let disabled = fallback($$props["disabled"], false);
  $$renderer.push(`<button${attr("id", id)}${attr("disabled", disabled, true)} class="svelte-k0uzko"><!--[-->`);
  slot($$renderer, $$props, "default", {});
  $$renderer.push(`<!--]--></button>`);
  bind_props($$props, { onClick, id, disabled });
}
function CookieManager($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let googleAnalyticsUniversalId, googleAnalytics4Id, customNecessaryCookies, adCookiesEnabled;
    let configuration = $$props["configuration"];
    function handleSubmitNecessaryCookies(value) {
      submitNecessaryCookies(value);
      if (value === "true") {
        initializeServices();
      }
      showCookieDisclaimer.set(false);
    }
    function allowCookies() {
      handleSubmitNecessaryCookies("true");
    }
    function declineCookies() {
      handleSubmitNecessaryCookies("false");
    }
    ({
      googleAnalyticsUniversalId,
      googleAnalytics4Id,
      customNecessaryCookies,
      adCookiesEnabled
    } = configuration?.services ?? {});
    if (store_get($$store_subs ??= {}, "$page", page)?.url.pathname) {
      if (isServiceEnabled(SupportedService.GoogleAnalyticsUniversal)) {
        updatePathGA(googleAnalyticsUniversalId, store_get($$store_subs ??= {}, "$page", page).url.pathname);
      } else {
        if (isServiceEnabled(SupportedService.GoogleAnalytics4)) {
          updatePathGA(googleAnalytics4Id, store_get($$store_subs ??= {}, "$page", page).url.pathname);
        }
      }
    }
    if (store_get($$store_subs ??= {}, "$showCookieDisclaimer", showCookieDisclaimer)) {
      $$renderer2.push("<!--[-->");
      Disclaimer($$renderer2, {
        allowCookies,
        declineCookies,
        configuration: configuration?.disclaimer,
        theme: configuration?.theme
      });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { configuration });
  });
}
function Disclaimer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let title, body;
    let configuration = fallback($$props["configuration"], () => ({}), true);
    let theme = fallback($$props["theme"], DEFAULT_THEME_COLORS);
    let allowCookies = fallback($$props["allowCookies"], () => {
    });
    let declineCookies = fallback($$props["declineCookies"], () => {
    });
    let style = "";
    ({ title, body } = configuration);
    style = getInlineStyle(theme);
    $$renderer2.push(`<div id="skcm-cookie-disclaimer"${attr_style(style)} class="svelte-xnw0fd"><div id="skcm-cookie-disclaimer__body">`);
    if (title) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<h6 id="skcm-title">${escape_html(title)}</h6>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <p id="skcm-body">${escape_html(body ?? DEFAULT_DISCLAIMER_CONFIG.body)} <a${attr("href", configuration?.policyUrl ?? DEFAULT_DISCLAIMER_CONFIG.policyUrl)} target="_blank" rel="noopener noreferrer"><span id="skcm-link__span">${escape_html(configuration?.policyText ?? DEFAULT_DISCLAIMER_CONFIG.policyText)}</span></a></p></div> <div id="skcm-cookie-disclaimer__buttons">`);
    Button($$renderer2, {
      onClick: allowCookies,
      id: "skcm-cookie-disclaimer__buttons--allow",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(configuration?.acceptButtonText ?? DEFAULT_DISCLAIMER_CONFIG.acceptButtonText)}`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Button($$renderer2, {
      onClick: declineCookies,
      id: "skcm-cookie-disclaimer__buttons--reject",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(configuration?.rejectButtonText ?? DEFAULT_DISCLAIMER_CONFIG.rejectButtonText)}`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div></div>`);
    bind_props($$props, { configuration, theme, allowCookies, declineCookies });
  });
}
function CookieBanner($$renderer) {
  const configuration = {
    disclaimer: {
      title: "This website uses cookies",
      body: "By using this site, you agree with our use of cookies"
    },
    theme: {
      primary: "#14cabf",
      dark: "#131f37",
      medium: "#b0bfd9",
      light: "#fff"
    }
  };
  CookieManager($$renderer, { configuration });
}
function _layout($$renderer, $$props) {
  let { children } = $$props;
  $$renderer.push(`<div class="flex min-h-dvh w-dvw items-center justify-center bg-gradient-to-br from-pink-500 via-purple-600 to-teal-400 p-4" style="font-family:'HP Simplified'"><div class="flex w-full flex-col sm:w-3xl">`);
  children($$renderer);
  $$renderer.push(`<!----></div></div> `);
  CookieBanner($$renderer);
  $$renderer.push(`<!---->`);
}
export {
  _layout as default
};
