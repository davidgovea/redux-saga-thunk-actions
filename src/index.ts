import { createStandardAction, PayloadMetaAC } from 'typesafe-actions';

interface SagaThunkMeta {
  readonly thunk: any;
}

export const createFailureAction = <ActionType extends string>(
  type: ActionType
) => {
  const selector = createStandardAction(type);
  return <Payload = Error, Meta = undefined>() =>
    selector.map((payload: Payload, meta: Meta) => ({
      payload,
      ...(meta ? { meta } : {}),
      error: true
    }));
};

export const createEventAction = <
  SuccessActionType extends string,
  FailureActionType extends string
>(
  successType: SuccessActionType,
  failureType: FailureActionType
) => {
  return <SuccessPayload, FailurePayload = Error>() => ({
    success: createStandardAction(successType)<SuccessPayload>(),
    failure: createFailureAction(failureType)<FailurePayload>()
  });
};

export const createSagaThunkAction = <
  RequestActionType extends string,
  SuccessActionType extends string,
  FailureActionType extends string
>(
  requestType: RequestActionType,
  successType: SuccessActionType,
  failureType: FailureActionType
) => {
  return <RequestPayload, SuccessPayload, FailurePayload = Error>() => {
    return {
      request: createStandardAction(requestType).map(
        (payload: RequestPayload) => ({
          payload,
          meta: { thunk: true }
        })
      ),
      success: createStandardAction(successType)<
        SuccessPayload,
        SagaThunkMeta
      >(),
      failure: createFailureAction(failureType)<FailurePayload, SagaThunkMeta>()
      // ...(cancelType ? { cancel: createStandardAction(cancelType)<P4>() } : {}),
    };
  };
};

interface SagaThunkActionApi<RequestPayload = any, OutputPayload = any> {
  readonly request: RequestPayload extends object | string | boolean
    ? (payload: RequestPayload) => any
    : () => any;
  success: (payload: OutputPayload, meta: SagaThunkMeta) => any;
  // failure: (payload: Error, meta: SagaThunkMeta) => any;
}
type ExtractSuccessPayload<T> = T extends {
  success: PayloadMetaAC<string, infer SuccessPayload, SagaThunkMeta>;
}
  ? SuccessPayload
  : any;

type AllowNoRequestParameters<
  ActionCreator extends SagaThunkActionApi,
  OutputType
> = Parameters<ActionCreator['request']> extends [any]
  ? (arg: Parameters<ActionCreator['request']>[0]) => OutputType
  : () => OutputType;

export type AwaitSaga<
  ActionCreator extends SagaThunkActionApi,
  OutputType = undefined
> = OutputType extends undefined
  ? AllowNoRequestParameters<
      ActionCreator,
      ExtractSuccessPayload<ActionCreator>
    >
  : AllowNoRequestParameters<ActionCreator, OutputType>;
export const awaitSaga = <
  OutputType = undefined,
  ActionCreator extends SagaThunkActionApi = any
>(
  sagaThunkActionCreator: ActionCreator
) =>
  (sagaThunkActionCreator.request as unknown) as AwaitSaga<
    ActionCreator,
    OutputType
  >;

export type TriggerSaga<ActionCreator extends SagaThunkActionApi> = AwaitSaga<
  ActionCreator,
  void
>;
export const triggerSaga = <ActionCreator extends SagaThunkActionApi>(
  sagaThunkActionCreator: ActionCreator
) => awaitSaga<void>(sagaThunkActionCreator);

export type AwaitSagaNoReturn<
  ActionCreator extends SagaThunkActionApi
> = AwaitSaga<ActionCreator, Promise<void>>;
export const awaitSagaNoReturn = <ActionCreator extends SagaThunkActionApi>(
  sagaThunkActionCreator: ActionCreator
) => awaitSaga<Promise<void>>(sagaThunkActionCreator);
