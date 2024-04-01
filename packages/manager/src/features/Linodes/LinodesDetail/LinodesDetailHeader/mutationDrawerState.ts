import { withStateHandlers } from 'recompose';

interface State {
  mutationDrawerError: string;
  mutationDrawerLoading: boolean;
  mutationDrawerOpen: boolean;
}

interface Handlers {
  [key: string]: any;
  closeMutationDrawer: () => void;
  mutationFailed: (error: string) => void;
  openMutationDrawer: () => void;
}

export interface MutationDrawerProps extends State, Handlers {}

export default withStateHandlers<State, Handlers>(
  (ownProps) => ({
    mutationDrawerError: '',
    mutationDrawerLoading: false,
    mutationDrawerOpen: false,
  }),
  {
    closeMutationDrawer: (state) => () => ({
      ...state,
      mutationDrawerOpen: false,
    }),

    mutationFailed: (state) => (error: string) => ({
      mutationDrawerError: error,
      mutationDrawerLoading: false,
      mutationDrawerOpen: true,
    }),

    openMutationDrawer: (state) => () => ({
      mutationDrawerError: '',
      mutationDrawerLoading: false,
      mutationDrawerOpen: true,
    }),
  }
);
