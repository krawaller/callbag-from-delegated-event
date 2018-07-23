import fromEvent from "callbag-from-event";
import filter from "callbag-filter";

const fromDelegatedEvent = (root, sel, evt) => filter(e => {
  let at = e.target;
  while(at !== root){
    if (at.matches(sel)) {
      return true;
    }
    at = at.parentElement;
  }
  return false;
})(fromEvent(root, evt));

export default fromDelegatedEvent;
