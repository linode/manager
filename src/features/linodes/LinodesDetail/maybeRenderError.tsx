import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { branch, compose, renderComponent } from 'recompose';
import ErrorState from 'src/components/ErrorState';
import { MapState } from 'src/store/types';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

interface OuterProps {
  configsError?: Linode.ApiFieldError[];
  typesError?: Linode.ApiFieldError[];
}

interface InnerProps {
  error?: Linode.ApiFieldError[] | Error;
}

const collectErrors: MapState<InnerProps, OuterProps> = (
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
      // @todo remove this patch
      (volumes.error && volumes.lastUpdated === 0 ? volumes.error : false) ||
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
      /**
       * props.error can either be an Error or Linode.APIFieldError
       * so we need to handle for both and look for the suspended message
       * in both paths
       */
      const errorTextFromAxios = getErrorStringOrDefault(
        props.error,
        'Unable to load Linode'
      );

      let errorText = pathOr(errorTextFromAxios, ['error', 0, 'reason'], props);

      if (errorText.toLowerCase() === 'this linode has been suspended') {
        errorText = (
          <React.Fragment>
            This Linode is suspended. Please{' '}
            <Link to="/support/tickets">open a support ticket </Link>
            if you have questions.
          </React.Fragment>
        );
      }

      return <ErrorState errorText={errorText} />;
    })
  )
);
