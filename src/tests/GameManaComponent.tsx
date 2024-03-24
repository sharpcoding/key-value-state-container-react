import React from "react";
import { RendersWithContainerId } from "../types/contracts";
import { State } from "./state-container/game-logic";
import { useEnhancedSelector } from "../use-enhanced-selector";

interface Props extends RendersWithContainerId {}

export const GameManaComponent = ({ containerId }: Props) => {
  const renderedRef = React.useRef<number>(0);
  const mana = useEnhancedSelector<State, number>({
    containerId,
    selector: ({ header }) => header.mana,
  })();
  renderedRef.current = renderedRef.current + 1;
  return (
    <div>
      <div data-testid="mana">Mana: {mana}</div>
      <div data-testid="rendered">Rendered: {renderedRef.current}</div>
    </div>
  );
};
