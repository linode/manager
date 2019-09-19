import { path } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { branch, compose, renderComponent } from 'recompose';
import ErrorState from 'src/components/ErrorState';
import { MapState } from 'src/store/types';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

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
    notifications,
    linodeConfigs,
    linodeDisks
  } = state.__resources;

  return {
    error:
      configsError ||
      typesError ||
      path(['error', 'read'], linodes) ||
      types.error ||
      notifications.error ||
      path(['error', 'read'], linodeConfigs) ||
      path(['error', 'read'], linodeDisks)
  };
};

/*
  Collect possible errors from Redux, configs request, and disks requests.
  If any are defined, render the ErrorComponent. (early return)
  
  IMPORTANT NOTE: The errors we're collecting here should only be the errors that
  dictate when the Linode detail page should bomb. You'll notice that we're not 
  collecting volumes errors here, and it's because we don't want to crash the entire
  page if there was an issue loading the volumes.
 */

export default compose(
  connect(collectErrors),
  branch(
    ({ error }) => Boolean(error),
    /** error is not the only prop, but it's the only one we care about */
    renderComponent((props: { error: Linode.ApiFieldError[] }) => {
      let errorText: string | JSX.Element = getAPIErrorOrDefault(
        props.error,
        'There was an issue retrieving your Linode. Please try again later.'
      )[0].reason;

      if (typeof errorText === 'string' && errorText.toLowerCase() === 'this linode has been suspended') {
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
