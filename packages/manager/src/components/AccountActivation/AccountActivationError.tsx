import * as React from 'react';
import { compose } from 'recompose';

// interface Props { }

type CombinedProps = any;

const AccountActivationError: React.FC<CombinedProps> = props => {
  return (
    <React.Fragment>
      Whoops! Looks like your account hasn't been activated yet.
    </React.Fragment>
  );
};

export default compose<CombinedProps, {}>(React.memo)(AccountActivationError);
