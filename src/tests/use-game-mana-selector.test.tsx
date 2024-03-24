import _ from "lodash";
import React from "react";

import { render, act } from "@testing-library/react";
import { finishedProcessingQueue } from "key-value-state-container";

import { reducer, dispatchActions } from "./state-container/game-logic";
import { ContainerRoot } from "../ContainerRoot";
import { GameManaComponent } from "./GameManaComponent";

const containerId = "use-enhanced-selector-state-container";
const initialMana = 1000;

test("useGameManaSelector test", async () => {
  /**
   * Mana spent for fighting monsters 👾.
   */
  const manaSpentRandomArray = Array.from({ length: 25 }, () => _.random(1, 8));
  const expectedManaLeft = manaSpentRandomArray.reduce(
    (acc, el) => acc - el,
    initialMana
  );
  const { getByTestId, unmount } = render(
    <ContainerRoot
      initialState={{
        header: {
          mana: initialMana,
          score: 500,
        },
      }}
      containerId={containerId}
      reducer={reducer}
    >
      <GameManaComponent containerId={containerId} />
    </ContainerRoot>
  );
  await act(async () => {
    dispatchActions({ containerId, randomArray: manaSpentRandomArray });
    await finishedProcessingQueue({ containerId });
  });
  expect(getByTestId("mana").innerHTML).toEqual(`Mana: ${expectedManaLeft}`);
  expect(getByTestId("rendered").innerHTML).toEqual("Rendered: 2");
  act(() => {
    unmount();
  });
});
