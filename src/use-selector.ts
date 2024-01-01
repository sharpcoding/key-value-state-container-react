import { useEffect, useRef, useState } from "react";
import {  
  Action,
  getContainer,
  registerStateChangedCallback,
  TKnownStatePath,
  unregisterStateChangedCallback,
  getUniqueId,
} from "key-value-state-container";
import { useGetContainerId } from "./use-get-container-id";
import { RendersWithContainerId } from "./types/contracts";

interface Args<TState extends Object> extends Partial<RendersWithContainerId> {
  /**
   * Diagnostics flag that helps to identify problems
   * @default true
   */
  ignoreUnregistered?: boolean;
  /**
   * Decides whether the callback will be invoked after all the actions from the
   * action queue have been processed (`true`), or the callback should get invoked
   * immediately, repainting the UI ASAP (`false`).
   *
   * Default value is `true`.
   */
  lateInvoke?: boolean;
  listenerTag?: string;
  statePath: TKnownStatePath<TState>[];
}

export const useSelector = <TState extends Object, TAction extends Action>({
  containerId: containerIdFromProps,
  ignoreUnregistered,
  lateInvoke,
  listenerTag,
  statePath,
}: Args<TState>) => {
  const listenerIdRef = useRef<string>(
    `${listenerTag ? `${listenerTag}:` : ""}${getUniqueId()}`
  );
  const unmountedRef = useRef<boolean>(false);
  const containerFromHook = useGetContainerId();
  const containerId = containerIdFromProps || containerFromHook;
  const initialState =
    getContainer<TState>({
      containerId,
      ignoreUnregistered:
        typeof ignoreUnregistered === "boolean" ? ignoreUnregistered : true,
    }) || {};
  const [currentState, setCurrentState] = useState(initialState);
  useEffect(() => {
    return () => {
      unmountedRef.current = true;
    };
  }, []);
  useEffect(() => {
    const statePathsLookup: Record<
      TKnownStatePath<TState>,
      true
    > = statePath.reduce((acc, path) => {
      acc[path] = true;
      return acc;
    }, {} as Record<TKnownStatePath<TState>, true>);
    registerStateChangedCallback<TState, TAction>({
      callback: ({ changedPaths, newState }) => {
        /**
         * Prevent receiving this React warning
         * "Can't perform a React state update on an unmounted component.
         * This is a no-op, but it indicates a memory leak in your application.
         * To fix, cancel all subscriptions and asynchronous tasks in a useEffect
         * cleanup function."
         */
        if (unmountedRef.current) {
          return;
        }
        if (
          typeof statePathsLookup["*"] === "boolean" ||
          changedPaths.some((path) => statePathsLookup[path])
        ) {
          setCurrentState(newState);
        }
      },
      lateInvoke: typeof lateInvoke === "boolean" ? lateInvoke : true,
      listenerId: listenerIdRef.current,
      containerId,
      statePath: "*",
    });
    return () => {
      unregisterStateChangedCallback<TState>({
        containerId,
        listenerId: listenerIdRef.current,
        statePath: "*",
      });
    };
  }, [setCurrentState]);

  return currentState;
};
