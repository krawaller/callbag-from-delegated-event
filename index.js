const fromEvent = require("callbag-from-event");
const filter = require("callbag-filter");

const fromDelegatedEvent = (root, sel, evt, between) => filter(e => {
  if (between){
    let at = e.target;
    while(at !== root){
      if (at.matches(sel)) {
        e.matchedElement = at;
        return true;
      }
      at = at.parentElement;
    }
    return false;
  } else return e.target.matches(sel);
})(fromEvent(root, evt));

module.exports = fromDelegatedEvent;
