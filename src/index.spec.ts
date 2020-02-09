import test from 'ava';

import {
  awaitSaga,
  awaitSagaNoReturn,
  createEventAction,
  createFailureAction,
  createSagaThunkAction,
  triggerSaga
} from '.';

// tslint:disable:no-expression-statement
test('saga-thunk action creator', t => {
  const sagaThunkAction = createSagaThunkAction(
    'ACTION_REQUEST',
    'ACTION_SUCCESS',
    'ACTION_FAILURE'
  )<boolean, boolean>();
  t.notThrows(() => {
    const requestAction = sagaThunkAction.request(true);
    t.is(requestAction.payload, true);

    const sagaThunkMeta = { thunk: {} };
    const successAction = sagaThunkAction.success(false, sagaThunkMeta);
    t.is(successAction.payload, false);

    const failureAction = sagaThunkAction.failure(
      new Error('error message'),
      sagaThunkMeta
    );
    t.truthy(failureAction.payload.message);
  });
});

test('saga-awaiting helpers', t => {
  const sagaThunkAction = createSagaThunkAction(
    'ACTION_REQUEST',
    'ACTION_SUCCESS',
    'ACTION_FAILURE'
  )<boolean, boolean>();
  t.notThrows(() => {
    const sagaTrigger = triggerSaga(sagaThunkAction);
    const awaitVoidPromise = awaitSagaNoReturn(sagaThunkAction);
    const awaitSagaSuccess = awaitSaga(sagaThunkAction);
    t.truthy(sagaTrigger);
    t.truthy(awaitVoidPromise);
    t.truthy(awaitSagaSuccess);
  });
});

test('event action creator', t => {
  const eventActions = createEventAction('EVENT_SUCCESS', 'EVENT_FAILURE')<
    boolean
  >();
  t.notThrows(() => {
    const successAction = eventActions.success(true);
    t.is(successAction.payload, true);

    const failureAction = eventActions.failure(new Error('error message'));
    t.truthy(failureAction.payload.message);
  });
});

test('failure action creator', t => {
  const failureAction = createFailureAction('GENERAL_FAILURE')();
  t.notThrows(() => {
    const action = failureAction(new Error('error message'));
    t.truthy(action.payload.message);
  });
});
