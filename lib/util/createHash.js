/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const BULK_SIZE = 1000;

class BulkUpdateDecorator {
	constructor(hash) {
		this.hash = hash;
		this.buffer = "";
	}

	update(data, inputEncoding) {
		if(inputEncoding !== undefined || typeof data !== "string" || data.length > BULK_SIZE) {
			if(this.buffer.length > 0) {
				this.hash.update(this.buffer);
				this.buffer = "";
			}
			this.hash.update(data, inputEncoding);
		} else {
			this.buffer += data;
			if(this.buffer.length > BULK_SIZE) {
				this.hash.update(this.buffer);
				this.buffer = "";
			}
		}
		return this;
	}

	digest(encoding) {
		if(this.buffer.length > 0) {
			this.hash.update(this.buffer);
		}
		var digestResult = this.hash.digest(encoding);
		return typeof digestResult === "string" ? digestResult : digestResult.toString();
	}
}

class DebugHash {
	constructor() {
		this.string = Buffer.alloc(0);
	}

	update(data, inputEncoding) {
		if(typeof data !== "string") data = data.toString("utf-8");
		this.string += data;
		return this;
	}

	digest(encoding) {
		return this.string.replace(/[^a-z0-9]+/gi, m => Buffer.from(m).toString("hex"));
	}
}

module.exports = algorithm => {
	if(typeof algorithm === "function") {
		return new BulkUpdateDecorator(new algorithm());
	}
	switch(algorithm) {
		case "debug": return new DebugHash();
		// TODO add non-cryptographic algorithm here
		default: return new BulkUpdateDecorator(require("crypto").createHash(algorithm));
	}
};