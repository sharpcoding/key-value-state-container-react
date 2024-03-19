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
  registerStateContainer as libRegisterStateContainer,
  unregisterStateContainer,
} from "key-value-state-container";

import { ContainerRootContext } from "./context";
import { ContainerRootProps } from "./props";

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

  const registerStateContainer = () => {
    libRegisterStateContainer({
      autoActions,
      autoState,
      config,
      containerId,
      initialState,
      persistence,
      reducer,
    });
  };

  const runningFirstTimeRef = useRef<boolean>(true);
  if (runningFirstTimeRef.current) {
    runningFirstTimeRef.current = false;
    /**
     * We need to register the container here, with the first render. 
     * 
     * Assuming the `console.log()` invocations are printed out for 
     * mount/unmount component lifecycle events (by `useEffect()`),
     * the printout for React 18 Strict Mode would look as follows:
     *
     * useSelector mounted ⭐️
     * ContainerRoot mounted ⭐️⭐️
     * useSelector unmounted
     * ContainerRoot unmounted
     * useSelector mounted ⭐️⭐️⭐️
     * ContainerRoot mounted
     * 
     * Please note is is way too late to register the container in the ⭐️⭐️
     * (as there was a `useSelector` call in ⭐️, that wanted to register 
     * callback listeners with an unregistered container!)
     *
     * The same story goes with `useSelector`, marked by ⭐️⭐️⭐️,
     * that needs a container to be registered.
     * 
     * Keep in mind the biggest possible memory issues for a container 
     * are the callback listeners mentioned above, 
     * as these can easily allocate GBs of memory
     * (btw. this problem is handled by the `useSelector` code)
     */
    registerStateContainer();
  }

  useEffect(() => {
    return () => {
      unregisterStateContainer({ containerId });
    };
  }, []);

  return (
    <ContainerRootContext.Provider
      value={{
        containerId,
        registerStateContainer,
      }}
    >
      {children}
    </ContainerRootContext.Provider>
  );
};
