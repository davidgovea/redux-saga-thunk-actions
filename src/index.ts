import { createStandardAction, PayloadMetaAC } from 'typesafe-actions';

interface SagaThunkMeta {
  readonly thunk: any;
}

export const createFailureAction = <T extends string>(type: T) => {
  const selector = createStandardAction(type);
  return <P = Error, M = undefined>() =>
    selector.map((payload: P, meta: M) => ({
      payload,
      ...(meta ? { meta } : {}),
      error: true
    }));
};

export const createEventAction = <T1 extends string, T2 extends string>(
  successType: T1,
  failureType: T2
) => {
  return <P1, P2 = Error>() => ({
    success: createStandardAction(successType)<P1>(),
    failure: createFailureAction(failureType)<P2>()
  });
};

export const createSagaThunkAction = <
  T1 extends string,
  T2 extends string,
  T3 extends string
>(
  requestType: T1,
  successType: T2,
  failureType: T3
) => {
  return <P1, P2, P3 = Error>() => {
    return {
      request: createStandardAction(requestType).map((payload: P1) => ({
        payload,
        meta: { thunk: true }
      })),
      success: createStandardAction(successType)<P2, SagaThunkMeta>(),
      failure: createFailureAction(failureType)<P3, SagaThunkMeta>()
      // ...(cancelType ? { cancel: createStandardAction(cancelType)<P4>() } : {}),
    };
  };
};

interface SagaThunkActionApi<In = any, Out = any> {
  readonly request: In extends object | string | boolean
    ? (payload: In) => any
    : () => any;
  success: (payload: Out, meta: SagaThunkMeta) => any;
  // failure: (payload: Error, meta: SagaThunkMeta) => any;
}
type SuccessPayload<T> = T extends {
  success: PayloadMetaAC<string, infer P, SagaThunkMeta>;
}
  ? P
  : any;

export const awaitSaga = <R = undefined, T extends SagaThunkActionApi = any>(
  sagaThunkActionCreator: T
) =>
  (sagaThunkActionCreator.request as unknown) as AwaitSaga<
    T,
    R extends undefined ? Promise<SuccessPayload<T>> : R
  >;

type AwaitSaga<T extends SagaThunkActionApi, R> = Parameters<
  T['request']
> extends [any]
  ? (arg: Parameters<T['request']>[0]) => R
  : () => R;

export const triggerSaga = <T extends SagaThunkActionApi>(
  sagaThunkActionCreator: T
) => awaitSaga<void>(sagaThunkActionCreator);

export const awaitSagaNoReturn = <T extends SagaThunkActionApi>(
  sagaThunkActionCreator: T
) => awaitSaga<Promise<void>>(sagaThunkActionCreator);
