import * as React from 'react';
import { compose } from 'recompose';
import withGlobalErrors, { Props, ReduxState } from 'src/containers/globalErrors.container'

type CombinedProps = Props;

const AccountActivationError: React.FC<CombinedProps> = props => {

  return (
    <React.Fragment>
      Whoops! Looks like your account hasn't been activated yet.
    </React.Fragment>
  );
};

interface S {
  hello: ReduxState
}

export default compose<CombinedProps, {}>(
  React.memo,
  withGlobalErrors<S, {}>((errors => ({
    hello: errors
  })))
)(AccountActivationError);
