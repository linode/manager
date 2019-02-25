import { pathOr } from 'ramda';
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
    linodeConfigs,
    linodeDisks
  } = state.__resources;

  return {
    error:
      configsError ||
      typesError ||
      linodes.error ||
      types.error ||
      volumes.error ||
      notifications.error ||
      linodeConfigs.error ||
      linodeDisks.error
  };
};

/**
 * Collect possible errors from Redux, configs request, and disks requests.
 * If any are defined, render the ErrorComponent. (early return)
 */

export default compose(
  connect(collectErrors),
  branch(
    ({ error }) => Boolean(error),
    renderComponent((props: any) => {
      const errorText = pathOr(
        'Unable to load Linode',
        ['error', 'response', 'error', 0, 'reason'],
        props
      );
      return <ErrorState errorText={errorText} />;
    })
  )
);
