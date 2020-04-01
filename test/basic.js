import { createState } from "../index.js";
import chai from "chai";

describe("State", function(){
	it("should trigger observe on change of known variables", () => {
		let log = [];
		const s = createState({ mode:"table", path:"/" });
		s.$observe("mode", v => log.push(v));
		s.$observe("path", v => log.push(v));
		s.$observe("other", v => log.push(v));

		s.mode = "list";
		s.mode = "both";
		s.path = "/some";
		s.other = "none";
		s.andmore = "none";

		chai.expect(log).to.deep.equal(["table", "/", log.undefined, "list", "both", "/some"])
	})

	it("should allow extending the state", () => {
		let log = [];
		const s = createState({ mode:"table" });
		s.$observe("mode", v => log.push(v));
		s.$observe("path", v => log.push(v));
		s.$observe("other", v => log.push(v));

		s.mode = "list";
		s.mode = "both";
		s.path = "/some";
		s.path = "/path";
		s.other = "none";
		s.andmore = "none";

		chai.expect(log).to.deep.equal(["table", log.undefined, log.undefined, "list", "both"])

		log = [];
		s.$extend({ path:"/" })

		s.mode = "list";
		s.mode = "both";
		s.path = "/some";
		s.path = "/path";
		s.other = "none";
		s.andmore = "none";

		chai.expect(log).to.deep.equal(["list", "both", "/some", "/path"])
	})
});