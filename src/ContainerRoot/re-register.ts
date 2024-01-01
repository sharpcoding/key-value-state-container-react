import {
  containerRegistered,
} from "key-value-state-container";
import React from "react";
import { RendersWithContainerId } from "../types/contracts";

/**
 * For React versions 18 and above, the state-container might be unregistered
 * due to wrapping with <React.StrictMode> component and invoking component unmount!
 */
export const reRegister = ({ containerId }: RendersWithContainerId) => {
  return (
    Number(React.version.split(".")[0]) >= 18 &&
    !containerRegistered({ containerId })
  );
};
