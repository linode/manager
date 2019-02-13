import * as React from 'react';
import { connect } from 'react-redux';
import { branch, compose, renderComponent } from 'recompose';
import ErrorState from 'src/components/ErrorState';
import { MapState } from 'src/store/types';

interface OutterProps {
  configsError?: Linode.ApiFieldError[];
  typesError?: Linode.ApiFieldError[];
}

interface InnerProps {
  error?: Linode.ApiFieldError[] | Error;
}

const collectErrors: MapState<InnerProps, OutterProps> = (
  state,
  { configsError, typesError }
) => {
  const {
    linodes,
    types,
    volumes,
    notifications,
    linodeConfigs
  } = state.__resources;

  return {
    error:
      configsError ||
      typesError ||
      linodes.error ||
      types.error ||
      volumes.error ||
      notifications.error ||
      linodeConfigs.error
  };
};

export default compose(
  connect(collectErrors),
  branch(
    ({ error }) => Boolean(error),
    renderComponent(() => <ErrorState errorText="Unable to load Linodes" />)
  )
);
