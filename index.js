import fromEvent from "callbag-from-event";
import filter from "callbag-filter";

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

export default fromDelegatedEvent;
