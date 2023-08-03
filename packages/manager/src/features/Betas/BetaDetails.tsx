import * as React from 'react';

import { Beta } from '@linode/api-v4/lib/betas';
import { AccountBeta } from '@linode/api-v4/lib/account';

// import { Typography } from 'src/components/Typography';

interface AccountBetaProps {
  beta: AccountBeta;
}

interface BetaProps {
  beta: Beta;
}
function BetaDetails(props: BetaProps): React.ReactElement;
function BetaDetails(props: AccountBetaProps) {
  const {
    beta: { label, started, description, ended, more_info },
  } = props;
  const enrolled = props.beta?.enrolled;
  return (
    <li>
      <p>Label: {label}</p>
      <p>Start Date: {started}</p>
      <p>Description: {description}</p>
      {ended ? <p>End Date: {ended}</p> : null}
      {enrolled ? <p>Enrolled: {enrolled}</p> : null}
      {more_info ? <p>More Info: {more_info}</p> : null}
    </li>
  );
}

export default BetaDetails;
