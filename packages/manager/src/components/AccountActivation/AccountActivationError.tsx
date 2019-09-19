import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { compose } from 'recompose';
import withGlobalErrors, { Props } from 'src/containers/globalErrors.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface InnerProps {
  errors: APIError[];
}

type CombinedProps = Props & InnerProps;

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
      {getAPIErrorOrDefault(
        props.errors,
        'Your account is not yet activated. Please reach out to support@linode.com for more information'
      )}
    </React.Fragment>
  );
};

export default compose<CombinedProps, InnerProps>(
  React.memo,
  withGlobalErrors()
)(AccountActivationError);
