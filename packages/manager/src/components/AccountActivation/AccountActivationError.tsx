import { Typography } from '@mui/material';
import * as React from 'react';
import { compose } from 'recompose';

import withGlobalErrors, { Props } from 'src/containers/globalErrors.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { FormattedAPIError } from 'src/types/FormattedAPIError';

interface InnerProps {
  errors: FormattedAPIError[];
}

interface CombinedProps extends Props, InnerProps {}

const AccountActivationError = (props: CombinedProps) => {
  React.useEffect(() => {
    /** set an account_unactivated error if one hasn't already been set */
    if (!props.globalErrors.account_unactivated) {
      props.setErrors({
        account_unactivated: true,
      });
    }
  }, [props.globalErrors]);

  return (
    <Typography>
      {
        getAPIErrorOrDefault(
          props.errors,
          'Your account is not yet activated. Please reach out to support@linode.com for more information'
        )[0].formattedReason
      }
    </Typography>
  );
};

export default compose<CombinedProps, InnerProps>(
  React.memo,
  withGlobalErrors()
)(AccountActivationError);
