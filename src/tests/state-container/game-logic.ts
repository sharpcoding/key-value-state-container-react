/**
 * The enhanced logic adds a special action `zero` that bypasses the reducer.
 */
import { dispatchAction, Reducer } from "key-value-state-container";

export type Action = {
  name: "use-mana";
  payload: number;
};

/**
 * Header as displayed on the screen
 */
type Header = {
  /**
   * Mana points.
   */
  mana: number;

  /**
   * The score of the user.
   */
  score: number;
};

export type State = {
  header: Header;
};

export const reducer: Reducer<State, Action> = async ({ state, action }) => {
  switch (action.name) {
    case "use-mana": {
      return {
        ...state,
        header: {
          ...state.header,
          mana: state.header.mana - action.payload,
        },
      };
    }
    default: {
      return state;
    }
  }
};

export const dispatchActions = ({
  containerId,
  randomArray,
}: {
  containerId: string;
  randomArray: number[];
}) => {
  for (let i = 0; i < randomArray.length; i++) {
    dispatchAction<State, Action>({
      action: {
        name: "use-mana",
        payload: randomArray[i],
      },
      containerId,
    });
  }
};
