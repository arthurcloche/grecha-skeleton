const LOREM =
	"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
const s = (prop) => prop.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
function style(styles) {
	let styleSheet = document.getElementById("grecha-styles");
	if (!styleSheet) {
		styleSheet = document.createElement("style");
		styleSheet.id = "grecha-styles";
		document.head.appendChild(styleSheet);
	}
	styleSheet.innerText = Object.entries(styles)
		.map(
			([selector, style]) =>
				`${selector} { ${Object.entries(style)
					.map(([prop, val]) => `${s(prop)}: ${val};`)
					.join(" ")} }`
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
		console.log(this);
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

function img(src) {
	return tag("img").att$("src", src);
}

function input(type) {
	return tag("input").att$("type", type);
}

function router(routes) {
	let result = div();
	function syncHash() {
		let hashLocation = document.location.hash.split("#")[1];
		if (!hashLocation) {
			hashLocation = "/";
		}
		if (!(hashLocation in routes)) {
			const route404 = "/404";
			console.assert(route404 in routes);
			hashLocation = route404;
		}
		style(styles());
		result.replaceChildren(routes[hashLocation]());
		return result;
	}
	syncHash();
	window.addEventListener("hashchange", syncHash);
	result.refresh = syncHash;
	return result;
}
