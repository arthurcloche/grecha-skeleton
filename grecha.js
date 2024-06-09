const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
const s = (prop) => prop.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
function Cleanup() {
  const cleanups = new Map();
  return {
    add: (key, callback) => {
      if (!key) {
        throw new Error("Component ID is required to register cleanup.");
      }
      cleanups.set(key, callback);
    },
    remove: (key) => {
      cleanups.delete(key);
    },
    has: (key) => cleanups.has(key),
    cleanup: () => {
      for (const [key, callback] of cleanups) {
        callback();
        cleanups.delete(key);
      }
    },
    log: () => console.log(Array.from(cleanups.keys())),
  };
}

const cleanup = Cleanup();

function State() {
  if (!window.state) {
    window.state = new Map();
  }
  return {
    set: (key, value, callback) => {
      window.state.set(key, value);
      if (callback) {
        callback(key, value);
      }
    },
    get: (key, callback) => {
      if (window.state.has(key)) {
        if (callback) {
          callback(key, window.state.get(key));
        }
        return window.state.get(key);
      }
    },
    has: (key) => window.state.has(key),
    delete: (key, callback) => {
      if (window.state.has(key)) {
        window.state.delete(key);
        if (callback) {
          callback(key);
        }
      }
    },
    log: () => window.state,
  };
}

function Style(styles) {
  let css = document.getElementById("grecha-styles");
  if (!css) {
    css = document.createElement("style");
    css.id = "grecha-styles";
    document.head.appendChild(css);
  }
  css.innerText = Object.entries(styles)
    .map(
      ([selector, style]) =>
        `${selector} { ${Object.entries(style)
          .map(([prop, val]) => `${s(prop)}: ${val};`)
          .join(" ")} }`
    )
    .join(" ");
}

function Tag(name, ...children) {
  const result = document.createElement(name);
  for (const child of children) {
    if (typeof child === "string") {
      result.appendChild(document.createTextNode(child));
    } else {
      result.appendChild(child);
    }
  }
  result.att$ = function (name, value) {
    this.setAttribute(name, value);
    return this;
  };
  result.style$ = function (styles) {
    for (const property in styles) {
      this.style[s(property)] = styles[property];
    }
    return this;
  };
  result.listen$ = function (listener, callback, global = false) {
    if (global) {
      window[listener] = callback;
      return this;
    } else {
      this[listener] = callback;
      return this;
    }
  };
  result.unmount$ = function (callback) {
    if (!cleanup.has(this.id)) {
      cleanup.add(this.id, () => callback(this));
    } else {
      console.warn(
        "An ID is required for unmount cleanup registration or the ID is already in use."
      );
    }
    return this;
  };
  result.callback$ = function (callback) {
    callback(this);
    return this;
  };
  return result;
}
// prettier-ignore
const MUNDANE_TAGS = ["canvas","h1","h2","h3","p","a","div","span","select",];
for (let tagName of MUNDANE_TAGS) {
  window[tagName] = (...children) => Tag(tagName, ...children);
}

const img = (src) => Tag("img").att$("src", src);
const input = (type) => Tag("input").att$("type", type);
const canvas = (id, width, height) =>
  Tag("canvas")
    .att$("id", id)
    .att$("width", width ?? 300)
    .att$("height", height ?? 150);

function Router(routes) {
  let result = div();
  function syncHash() {
    let hashLocation = document.location.hash.split("#")[1] || "/";
    // console.log(hashLocation);
    let [path, queryString] = hashLocation.split("?");
    if (!(path in routes)) {
      path = "/404";
    }
    Style(styles());

    const params = new URLSearchParams(queryString);
    // console.log(params);
    const routeComponent = routes[path];
    result.replaceChildren(routeComponent(params));
    return result;
  }
  syncHash();
  window.addEventListener("hashchange", syncHash);
  window.onpopstate = () => {
    cleanup.cleanup();
  };
  result.refresh = syncHash;

  return result;
}
