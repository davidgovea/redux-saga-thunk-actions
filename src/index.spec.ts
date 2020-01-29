// tslint:disable:no-expression-statement
import test from 'ava';
import { createSagaThunkAction } from './index';

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
