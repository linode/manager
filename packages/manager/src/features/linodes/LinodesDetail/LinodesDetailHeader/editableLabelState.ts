import { withStateHandlers } from 'recompose';

interface State {
  editableLabelError: string;
}

interface Handlers {
  resetEditableLabel: () => State;
  setEditableLabelError: (error: string) => State;
  [key: string]: any;
}

export type EditableLabelProps = State & Handlers;

export default withStateHandlers<State, Handlers, { linodeLabel: string }>(
  ({ linodeLabel }) => ({
    editableLabelError: ''
  }),
  {
    resetEditableLabel: (state, { linodeLabel }) => () => ({
      ...state,
      editableLabelError: ''
    }),

    setEditableLabelError: (state, ownProp) => errorText => ({
      ...state,
      editableLabelError: errorText
    })
  }
);
