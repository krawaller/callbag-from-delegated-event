const test = require('tape');
const fromDelegatedEvent = require('.');
const makeMockCallbag = require('callbag-mock');

const jsdom = require('jsdom').JSDOM;

const fire = (dom, node, evt, desc) => {
  let event = new dom.window.MouseEvent(evt, {bubbles: true, relatedTarget: node});
  event.desc = desc;
  node.dispatchEvent(event);
}

test('it sets up delegated events', tape => {

  const dom = new jsdom(`
    <div class="board">
      <div class="pawn"><div class="child"></div></div>
      <div class="bishop"></div>
    </div>
  `);

  const doc = dom.window.document;
  const board = doc.querySelector('.board');
  const pawn = doc.querySelector('.pawn');
  const pawnChild = doc.querySelector('.child');
  const bishop = doc.querySelector('.bishop');

  const source = fromDelegatedEvent(board, '.pawn', 'click');
  const sink = makeMockCallbag();

  source(0, sink);

  fire(dom, bishop, 'click', 'siblingEventNotCaptured');
  fire(dom, board, 'click', 'rootEventNotCaptured');
  fire(dom, pawn, 'hover', 'wrongTypeNotCaptured');
  fire(dom, pawn, 'click', 'pawnClickCaptured');
  fire(dom, pawnChild, 'click', 'pawnChildClickCaptured');

  const capturedEvents = sink.getReceivedData();
  tape.equal(capturedEvents.length, 2);
  tape.equal(capturedEvents[0].desc, 'pawnClickCaptured');
  tape.equal(capturedEvents[1].desc, 'pawnChildClickCaptured');

  tape.end();
});

test('it cleans up listeners on termination', tape => {
  let history = [];
  let listener;

  const fakeNode = {
    addEventListener(type, handler){
      listener = handler;
      history.push(['added listener', type]);
    },
    removeEventListener(type, handler){
      history.push(['removed listener', type, handler === listener]);
    }
  }

  const sink = makeMockCallbag();

  fromDelegatedEvent(fakeNode, '.whatev', 'someEvt')(0, sink);
  sink.emit(2);

  tape.deepEqual(history, [
    ['added listener', 'someEvt'],
    ['removed listener', 'someEvt', true],
  ], 'cleaned up handlers after termination');

  tape.end();
});
