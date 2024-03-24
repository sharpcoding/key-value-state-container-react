/**
  The MIT License (MIT)
  
  Copyright Tomasz Szatkowski, Patryk Parcheta
  WealthArc https://www.wealtharc.com (c) 2023, 2024
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

import {
  getContainer,
  getUniqueId,
  registerStateChangedCallback,
  unregisterStateChangedCallback,
} from "key-value-state-container";
import { useCallback, useEffect, useRef, useState } from "react";
import { Selector } from "types/contracts";

type Args<TState extends Object, TResult> = {
  containerId: string;
  selector: Selector<TState, TResult>;
  lateInvoke?: boolean;
};

export const useEnhancedSelector =
  <TState extends Object, TResult>({
    selector,
    containerId,
    lateInvoke,
  }: Args<TState, TResult>) =>
  (): TResult => {
    const listenerIdRef = useRef(getUniqueId());

    const memoizedSelector = useCallback(selector, []);

    const [selectedState, setSelectedState] = useState<ReturnType<any>>(() => {
      return memoizedSelector(
        getContainer<TState>({
          containerId,
          ignoreUnregistered: true,
        })
      );
    });

    useEffect(() => {
      const listenerId = listenerIdRef.current;
      const lateInvokeValue =
        typeof lateInvoke === "undefined" ? true : lateInvoke;

      registerStateChangedCallback<TState, any>({
        callback: ({ newState }) => {
          const newSelectValue = memoizedSelector(newState);

          if (
            JSON.stringify(selectedState) !== JSON.stringify(newSelectValue)
          ) {
            setSelectedState(newSelectValue);
          }
        },
        listenerId,
        containerId,
        lateInvoke: lateInvokeValue,
        statePath: "*",
      });

      return () => {
        unregisterStateChangedCallback({
          containerId,
          lateInvoke: lateInvokeValue,
          listenerId,
          statePath: "*",
        });
      };
    }, [memoizedSelector, selectedState]);

    return selectedState;
  };
