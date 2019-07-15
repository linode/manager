import { withStateHandlers } from 'recompose';

interface State {
  configDrawerOpen: boolean;
  configDrawerError?: string;
  configDrawerSelected?: number;
  configDrawerAction?: (id: number) => void;
}

interface Handlers {
  openConfigDrawer: (
    configs: Linode.Config[],
    action: (id: number) => void
  ) => State;
  closeConfigDrawer: () => State;
  configDrawerSelectConfig: (id: number) => State;
}

const initialState = {
  configDrawerOpen: false,
  configDrawerError: undefined,
  configDrawerSelected: undefined,
  configDrawerAction: undefined
};

export type ConfigDrawerProps = State & Handlers;

export default withStateHandlers<State, Handlers & Record<string, any>>(
  initialState,
  {
    openConfigDrawer: state => (_, action: (id: number) => void) => ({
      ...state,
      configDrawerOpen: true,
      configDrawerError: undefined,
      configDrawerSelected: undefined,
      configDrawerAction: action
    }),

    closeConfigDrawer: state => () => ({
      ...state,
      configDrawerOpen: false
    }),

    configDrawerSelectConfig: state => (id: number) => ({
      ...state,
      configDrawerSelected: id
    })
  }
);
