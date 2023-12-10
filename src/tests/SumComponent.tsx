import React from "react";
import { useSelector } from "../use-selector";
import { RendersWithContainerId } from "../types/contracts";
import { Action, State } from "./state-container/enhanced-logic";

export interface RendersWithListeningToPath {
  path: keyof State | "*";
}

interface Props extends RendersWithContainerId, RendersWithListeningToPath {}

export const SumComponent = ({ containerId, path }: Props) => {
  const renderedRef = React.useRef<number>(0);
  const { sum } = useSelector<State, Action>({
    containerId,
    statePath: [path],
  });
  renderedRef.current = renderedRef.current + 1;
  return <div data-testid="sum">The sum is: {sum}</div>;
};
