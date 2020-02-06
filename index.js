var index = 1;
function uid() {
	return index++;
}

var empty = undefined;

export function ignoreInitial(code) {
	let init = false;
	return function() {
		if (init) return code.apply(this, arguments);
		else init = true;
	};
}

var context = null;
export function withContext(value, code) {
	context = value;
	code();
	context = null;
}

export function filter(rule, handler) {
	return function(v, o, obj, meta) {
		if (rule(v, meta)) handler.apply(this, arguments);
	};
}

export function link(source, target, key) {
	Object.defineProperty(target, key, {
		get: () => source[key],
		set: value => (source[key] = value),
	});
}

export function debounce(handler, delay) {
	delay = delay || 200;
	let timer = null;
	let data = null;
	return function() {
		data = arguments;
		if (!timer) {
			timer = setTimeout(() => {
				clearTimeout(timer);
				timer = null;

				handler.apply(this, data);
			}, delay);
		}
	};
}

export function createState(data, config) {
	config = config || {};
	const handlers = {};
	const out = {};

	const observe = function(mask, handler) {
		var key = uid();
		handlers[key] = { mask, handler };
		if (mask === "*") handler(out, empty, mask);
		else handler(out[mask], empty, mask);

		return key;
	};

	const observeEnd = function(id) {
		delete handlers[id];
	};

	const queue = [];
	let waitInQueue = false;

	var batch = function(code) {
		if (typeof code !== "function") {
			const values = code;
			code = () => {
				for (const key in values) out[key] = values[key];
			};
		}

		waitInQueue = true;
		code(out);
		waitInQueue = false;
		while (queue.length) {
			const obj = queue.shift();
			notify.apply(this, obj);
		}
	};

	const notify = function(key, old, value, meta) {
		if (waitInQueue) {
			queue.push([key, old, value, meta]);
			return;
		}

		const list = Object.keys(handlers);
		for (let i = 0; i < list.length; i++) {
			const obj = handlers[list[i]];
			if (!obj) continue;
			if (obj.mask === "*" || obj.mask === key) {
				obj.handler(value, old, key, meta);
			}
		}
	};

	// normal js object
	for (const key2 in data) {
		if (data.hasOwnProperty(key2)) {
			const test = data[key2];
			if (config.nested && typeof test === "object" && test) {
				out[key2] = createState(test, config);
			} else {
				reactive(out, test, key2, notify);
			}
		}
	}

	Object.defineProperty(out, "$changes", {
		value: {
			attachEvent: observe,
			detachEvent: observeEnd,
		},
		enumerable: false,
		configurable: false,
	});
	Object.defineProperty(out, "$observe", {
		value: observe,
		enumerable: false,
		configurable: false,
	});
	Object.defineProperty(out, "$batch", {
		value: batch,
		enumerable: false,
		configurable: false,
	});

	return out;
}

function reactive(obj, val, key, notify) {
	Object.defineProperty(obj, key, {
		get: function() {
			return val;
		},
		set: function(value) {
			var changed = false;
			if (val === null || value === null) {
				changed = val !== value;
			} else {
				changed = val.valueOf() != value.valueOf();
			}

			if (changed) {
				var old = val;
				val = value;
				notify(key, old, value, context);
			}
		},
		enumerable: true,
		configurable: false,
	});
}