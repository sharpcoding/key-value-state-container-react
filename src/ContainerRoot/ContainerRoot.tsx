/**
  The MIT License (MIT)
  
  Copyright Tomasz Szatkowski and WealthArc https://www.wealtharc.com (c) 2023 
  
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

import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import {
  Action,
  getUniqueId,
  registerStateContainer,
  unregisterStateContainer,
} from "key-value-state-container";

import { ContainerRootContext } from "./context";
import { ContainerRootProps } from "./props";
import { reRegister } from "./re-register";

export const ContainerRoot = <TState extends Object, TAction extends Action>(
  props: PropsWithChildren<ContainerRootProps<TState, TAction>>
) => {
  const [autoContainerId] = useState<string>(getUniqueId());
  const {
    autoActions,
    autoState,
    children,
    config,
    containerId = autoContainerId,
    initialState,
    persistence,
    reducer,
  } = props;
  const runningFirstTimeRef = useRef<boolean>(true);
  if (runningFirstTimeRef.current) {
    runningFirstTimeRef.current = false;
    registerStateContainer({
      autoActions,
      autoState,
      config,
      containerId,
      initialState,
      persistence,
      reducer,
    });
  }

  useEffect(() => {
    /**
     * Checking for unregistered container
     * Container might be unregistered due to `useEffect` return function
     * called twice in React 18 Strict Mode
     */
    if (reRegister({ containerId })) {
      registerStateContainer({
        autoActions,
        autoState,
        config,
        containerId,
        initialState,
        persistence,
        reducer,
      });
    }
    return () => {
      unregisterStateContainer({
        containerId,
      });
    };
  }, []);

  return (
    <ContainerRootContext.Provider
      value={{
        containerId,
      }}
    >
      {children}
    </ContainerRootContext.Provider>
  );
};
