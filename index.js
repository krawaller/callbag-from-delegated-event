const fromEvent = require("callbag-from-event");
const filter = require("callbag-filter");

const fromDelegatedEvent = (node, sel, evt) => filter(e => e.target.matches(sel))(fromEvent(node, evt));

module.exports = fromDelegatedEvent;
