import { useEffect, useRef, useState } from "react";
import {
  Action,
  ClientNotificationCallbackArgs,
  containerRegistered,
  getContainer,
  getUniqueId,
  registerStateChangedCallback,
  TKnownStatePath,
  unregisterStateChangedCallback,
} from "key-value-state-container";
import { RendersWithContainerId } from "./types/contracts";
import { useGetContext } from "./use-get-context";

interface Args<TState extends Object, TAction extends Action = Action>
  extends Partial<RendersWithContainerId> {
  callback?: (args: ClientNotificationCallbackArgs<TState, TAction>) => void;
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

  statePath: TKnownStatePath<TState>[] | TKnownStatePath<TState>;

  /**
   * When `true`, selector code will be not active (will not register any callback)
   * and always return the current container state (as it is), so the hook will no
   * longer be a hook, but a simple function.
   *
   * Reason for introduction: it is not possible to have code that calls hooks
   * conditionally, as this will violate rules of hooks, so this is a workaround.
   * So, in other words, it is not possible to have something like this:
   *
   * ```
   * if (hookNonNecessary) {
   *   return;
   * }
   * const result = useHook();
   * ```
   * The purpose is to makes code more linear and easier to maintain.
   */
  switchOff?: boolean;
}

export const useSelector = <
  TState extends Object,
  TAction extends Action = Action
>({
  callback,
  containerId: containerIdFromProps,
  ignoreUnregistered,
  lateInvoke: lateInvokeFromProps,
  listenerTag,
  statePath,
  switchOff,
}: Args<TState>) => {
  const listenerIdRef = useRef<string>(
    `${listenerTag ? `${listenerTag}:` : ""}${getUniqueId()}`
  );
  const unmountedRef = useRef<boolean>(false);
  const { containerIdFromContext, registerStateContainer } = useGetContext();
  const containerId = containerIdFromProps || containerIdFromContext;
  const initialState =
    getContainer<TState>({
      containerId,
      ignoreUnregistered:
        typeof ignoreUnregistered === "boolean" ? ignoreUnregistered : true,
    }) || {};
  const lateInvoke =
    typeof lateInvokeFromProps === "boolean" ? lateInvokeFromProps : true;
  const [currentState, setCurrentState] = useState(initialState);

  useEffect(() => {
    /**
     * Component gets mounted
     */
    unmountedRef.current = false;
  }, []);

  useEffect(() => {
    if (switchOff) {
      return;
    }
    /**
     * Awkward, but necessary logic, explained in ContextRoot.tsx component.
     */
    if (!containerRegistered({ containerId })) {
      registerStateContainer();
    }
    const statePaths =
      typeof statePath === "string"
        ? [statePath]
        : (statePath as TKnownStatePath<TState>[]);
    const statePathsLookup: Record<
      TKnownStatePath<TState>,
      true
    > = statePaths.reduce((acc, path) => {
      acc[path] = true;
      return acc;
    }, {} as Record<TKnownStatePath<TState>, true>);
    registerStateChangedCallback<TState, TAction>({
      callback: ({ action, changedPaths, newState, oldState }) => {
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
        if (callback) {
          callback({ action, changedPaths, newState, oldState });
        }
      },
      containerId,
      lateInvoke,
      listenerId: listenerIdRef.current,
      statePath: "*",
    });
    return () => {
      if (switchOff) {
        return;
      }
      unregisterStateChangedCallback<TState>({
        containerId,
        lateInvoke,
        listenerId: listenerIdRef.current,
        statePath: "*",
      });
    };
  }, [setCurrentState]);

  useEffect(() => {
    console.log("useSelector mounted");
    return () => {
      console.log("useSelector unmounted");
      /**
       * component gets unmounted
       */
      unmountedRef.current = true;
    };
  }, []);

  return currentState;
};
