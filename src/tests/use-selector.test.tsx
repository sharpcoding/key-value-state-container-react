import _ from "lodash";
import React from "react";

import { render, act } from "@testing-library/react";
import { finishedProcessingQueue } from "key-value-state-container";

import { reducer, dispatchActions } from "./state-container/enhanced-logic";
import { RendersWithListeningToPath, SumComponent } from "./SumComponent";
import { ContainerRoot } from "../ContainerRoot";

const containerId = "use-selector-state-container";

const useSelectorTest = async ({ path }: RendersWithListeningToPath) => {
  const randomArray = Array.from({ length: 1000 }, () => _.random(-5000, 5000));
  const expectedSum = randomArray.reduce((acc, curr) => acc + curr, 0);
  const { getByTestId, unmount } = render(
    <ContainerRoot
      initialState={{ increments: 0, decrements: 0, sum: 0 }}
      containerId={containerId}
      reducer={reducer}
    >
      <SumComponent containerId={containerId} path={path} />
    </ContainerRoot>
  );
  await act(async () => {
    dispatchActions({ containerId, randomArray });
    await finishedProcessingQueue({ containerId });
  });
  expect(getByTestId("sum").innerHTML).toEqual(`The sum is: ${expectedSum}`);
  act(() => {
    unmount();
  });
};

test("useSelector - summing randomly generated numbers by listening to sum attribute", async () => {
  await useSelectorTest({ path: "sum" });
});

test("useSelector - summing randomly generated numbers by listening to wildcard * attribute", async () => {
  await useSelectorTest({ path: "*" });
});
