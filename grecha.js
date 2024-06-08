const LOREM =
	"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
const s = (prop) => prop.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

window.state = new Map();

function setState(key, value) {
	window.state.set(key, value);
}

function getState(key) {
	try {
		if (!window.state.has(key)) {
			throw new Error(`State key "${key}" does not exist.`);
		}
		return window.state.get(key);
	} catch (error) {
		console.error(error.message);
	}
}

function clearState(key) {
	if (window.state.has(key)) {
		window.state.delete(key);
	}
}

function style(styles) {
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
					.join(" ")} }`,
		)
		.join(" ");
}

function tag(name, ...children) {
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
	result.listen$ = function (listener, callback) {
		this[listener] = callback;
		return this;
	};
	return result;
}
// prettier-ignore
const MUNDANE_TAGS = ["canvas","h1","h2","h3","p","a","div","span","select",];
for (let tagName of MUNDANE_TAGS) {
	window[tagName] = (...children) => tag(tagName, ...children);
}

const img = (src) => tag("img").att$("src", src);
const input = (type) => tag("input").att$("type", type);
const canvas = (id, width, height) => tag("canvas").att$("id", id);

function router(routes) {
	let result = div();
	function syncHash() {
		let hashLocation = document.location.hash.split("#")[1] || "/";
		console.log(hashLocation);
		let [path, queryString] = hashLocation.split("?");
		if (!(path in routes)) {
			path = "/404";
		}
		style(styles());
		const params = new URLSearchParams(queryString);
		console.log(params);
		const routeComponent = routes[path];
		result.replaceChildren(routeComponent(params));
		return result;
	}
	syncHash();
	window.addEventListener("hashchange", syncHash);
	result.refresh = syncHash;

	return result;
}
