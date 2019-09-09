import * as React from 'react';
import { compose } from 'recompose';
import withGlobalErrors, { Props } from 'src/containers/globalErrors.container';

type CombinedProps = Props;

const AccountActivationError: React.FC<CombinedProps> = props => {
  React.useEffect(() => {
    /** set an account_unactivated error if one hasn't already been set */
    if (!props.globalErrors.account_unactivated) {
      props.setErrors({
        account_unactivated: true
      });
    }
  }, [props.globalErrors]);

  return (
    <React.Fragment>
      Whoops! Looks like your account hasn't been activated yet.
    </React.Fragment>
  );
};

export default compose<CombinedProps, {}>(
  React.memo,
  withGlobalErrors()
)(AccountActivationError);
