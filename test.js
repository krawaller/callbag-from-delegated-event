const test = require('tape');
const fromDelegatedEvent = require('./index');
const map = require('callbag-map');

const jsdom = require('jsdom').JSDOM;

test('it sets up delegated events', t => {

  let history = [];
  const report = (name,dir,t,d) => t !== 0 && history.push([name,dir,t,d]);

  const dom = new jsdom(`
    <div class="board">
      <div class="pawn"></div>
      <div class="bishop"></div>
    </div>
  `);

  const fire = (node, evt, desc) => {
    event = new dom.window.MouseEvent(evt, {bubbles: true, relatedTarget: node});
    event.desc = desc;
    node.dispatchEvent(event);
  }

  const doc = dom.window.document;
  const board = doc.querySelector('.board');
  const pawn = doc.querySelector('.pawn');
  const bishop = doc.querySelector('.bishop');

  const source = fromDelegatedEvent(board, '.pawn', 'click');
  const sink = makeMockCallbag('sink', report);

  map(e => e.desc)(source)(0, sink);

  fire(bishop, 'click', 'siblingEventNotCaptured');
  fire(board, 'click', 'rootEventNotCaptured');
  fire(pawn, 'hover', 'wrongTypeNotCaptured');
  fire(pawn, 'click', 'pawnClickCaptured');

  t.deepEqual(history, [
    ['sink', 'fromUp', 1, 'pawnClickCaptured'],
  ], 'sources gets evts that match type and selector');

  t.end();
});

test('it cleans up listeners on termination', t => {
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

  t.deepEqual(history, [
    ['added listener', 'someEvt'],
    ['removed listener', 'someEvt', true],
  ], 'cleaned up handlers after termination');

  t.end();
});

function makeMockCallbag(name, report=()=>{}, isSource) {
  if (report === true) {
    isSource = true;
    report = ()=>{};
  }
  let talkback;
  let mock = (t, d) => {
    report(name, 'fromUp', t, d);
    if (t === 0){
      talkback = d;
      if (isSource) talkback(0, (st, sd) => report(name, 'fromDown', st, sd));
    }
  };
  mock.emit = (t, d) => {
    if (!talkback) throw new Error(`Can't emit from ${name} before anyone has connected`);
    talkback(t, d);
  };
  return mock;
}
