# callbag-from-delegated-event

Create a [callbag](https://github.com/callbag/callbag) listenable source from events on a DOM node. The events are filtered to those where the target element matches the given selector.

`npm install callbag-from-delegated-event`

## example

Create a listenable source of click events on `.pawn` elements in a surrounding game board.

```js
const fromEvent = require('callbag-from-delegated-event');
const forEach = require('callbag-forEach');

const pawnClicks = fromEvent(gameBoard, '.pawn', 'click');

forEach(x => console.log(x))(pawnClicks); // MouseEvent ...
                                          // MouseEvent ...
```
