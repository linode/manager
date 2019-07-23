import { StateHandlerMap, withStateHandlers } from 'recompose';

export interface LoadingAndErrorState {
  loading: boolean;
  error?: string;
}

export interface LoadingAndErrorHandlers {
  setLoadingAndClearErrors: () => void;
  setErrorAndClearLoading: (error: string) => void;
  clearLoadingAndErrors: () => void;
}

export type Props = LoadingAndErrorHandlers & LoadingAndErrorState;

type StateAndStateUpdaters = StateHandlerMap<LoadingAndErrorState> &
  LoadingAndErrorHandlers;

/**
 * This function is intended to be used similar to HOCs for the purpose of
 * supplying the child component with a loading and error context.
 *
 * An example usage would look similar to the following
 *
 * @example
 * const getMyInstances = () => {
 *
 *  setLoadingAndClearErrors();
 *
 *  return getInstances()
 *   .then(response => {
 *      clearLoadingAndErrors();
 *   })
 *   .catch(e => {
 *      setErrorAndClearLoading('There was an issue!')
 *   })
 * }
 *
 *
 * render() {
 *  if (props.loading) { return <span>Loading...</span> }
 *
 *  if (props.error) { return <span>Error message!</span> }
 *
 *  return (<div>Hello world!</div>)
 * }
 */
const withStateAndHandlers = withStateHandlers<
  LoadingAndErrorState,
  StateAndStateUpdaters,
  {}
>(
  {
    loading: false,
    error: undefined
  },
  {
    setLoadingAndClearErrors: () => () => ({
      loading: true,
      error: undefined
    }),
    setErrorAndClearLoading: () => (error: string) => ({
      loading: false,
      error
    }),
    clearLoadingAndErrors: () => () => ({
      loading: false,
      error: undefined
    })
  }
);

const withLoadingAndError = (Component: any) => withStateAndHandlers(Component);

export default withLoadingAndError;
