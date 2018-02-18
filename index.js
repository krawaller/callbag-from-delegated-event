const fromEvent = require("callbag-from-event");
const filter = require("callbag-filter");

const fromDelegatedEvent = (node, sel, evt, between) => filter(e => {
  if (between){
    let at = e.target;
    while(at.parentElement !== node){
      if (at.matches(sel)) {
        e.matchedElement = at;
        return true;
      }
      at = at.parentElement;
    }
    if (at.matches(sel)){
      e.matchedElement = at;
      return true;
    }
    return false;
  } else return e.target.matches(sel);
})(fromEvent(node, evt));

module.exports = fromDelegatedEvent;
