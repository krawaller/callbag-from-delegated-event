const test = require('tape');
const fromDelegatedEvent = require('./index');
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
      <div class="pawn"></div>
      <div class="bishop"></div>
    </div>
  `);

  const doc = dom.window.document;
  const board = doc.querySelector('.board');
  const pawn = doc.querySelector('.pawn');
  const bishop = doc.querySelector('.bishop');

  const source = fromDelegatedEvent(board, '.pawn', 'click');
  const sink = makeMockCallbag('sink', (name,dir,t,d) => {
    if (t === 1){
      tape.equal(d.target, pawn);
      tape.equal(d.desc, 'pawnClickCaptured');
    }
  });

  source(0, sink);

  fire(dom, bishop, 'click', 'siblingEventNotCaptured');
  fire(dom, board, 'click', 'rootEventNotCaptured');
  fire(dom, pawn, 'hover', 'wrongTypeNotCaptured');
  fire(dom, pawn, 'click', 'pawnClickCaptured');

  tape.plan(2);
  tape.end();
});

test('it catches matching el between target and root', tape => {
  let history = [];

  const dom = new jsdom(`
    <div class="board">
      <div class="pawn"><div class="body"></div></div>
      <div class="bishop"></div>
    </div>
  `);

  const doc = dom.window.document;
  const board = doc.querySelector('.board');
  const pawn = doc.querySelector('.pawn');
  const body = doc.querySelector('.body');
  const bishop = doc.querySelector('.bishop');

  const source = fromDelegatedEvent(board, '.pawn', 'click', true);
  const sink = makeMockCallbag('sink', (name,dir,t,d) => {
    if (t === 1){
      tape.equal( d.matchedElement, pawn );
    }
  });

  source(0, sink);

  fire(dom, body, 'click', 'bodyClickCaptured');
  fire(dom, bishop, 'click', 'siblingClickNotCaptured');
  fire(dom, board, 'click', 'rootClickNotCaptured');

  tape.plan(1);
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

  const sink = makeMockCallbag('sink');

  fromDelegatedEvent(fakeNode, '.whatev', 'someEvt')(0, sink);
  sink.emit(2);

  tape.deepEqual(history, [
    ['added listener', 'someEvt'],
    ['removed listener', 'someEvt', true],
  ], 'cleaned up handlers after termination');

  tape.end();
});
