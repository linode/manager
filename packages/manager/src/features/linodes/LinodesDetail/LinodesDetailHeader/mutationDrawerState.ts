import { withStateHandlers } from 'recompose';

interface State {
  mutationDrawerOpen: boolean;
  mutationDrawerLoading: boolean;
  mutationDrawerError: string;
}

interface Handlers {
  openMutationDrawer: () => void;
  closeMutationDrawer: () => void;
  mutationFailed: (error: string) => void;
  [key: string]: any;
}

export type MutationDrawerProps = State & Handlers;

export default withStateHandlers<State, Handlers>(
  ownProps => ({
    mutationDrawerError: '',
    mutationDrawerLoading: false,
    mutationDrawerOpen: false
  }),
  {
    openMutationDrawer: state => () => ({
      mutationDrawerError: '',
      mutationDrawerLoading: false,
      mutationDrawerOpen: true
    }),

    closeMutationDrawer: state => () => ({
      ...state,
      mutationDrawerOpen: false
    }),

    mutationFailed: state => (error: string) => ({
      mutationDrawerError: error,
      mutationDrawerLoading: false,
      mutationDrawerOpen: true
    })
  }
);
