import * as React from 'react';
import Stack from '@mui/material/Stack';

import { Beta } from '@linode/api-v4/lib/betas';
import { AccountBeta } from '@linode/api-v4/lib/account';
import { Typography } from 'src/components/Typography';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Button } from 'src/components/Button/Button';

interface AccountBetaProps {
  beta: AccountBeta;
}

interface BetaProps {
  beta: Beta;
}

function BetaDetails(props: BetaProps): React.ReactElement;
function BetaDetails(props: AccountBetaProps) {
  const {
    beta: { label, started, description, ended },
  } = props;
  const enrolled = props.beta?.enrolled;
  const startDate = <DateTimeDisplay displayTime={false} value={started} />;
  const endDate = ended ? (
    <Typography>
      End Date: <DateTimeDisplay displayTime={false} value={ended} />
    </Typography>
  ) : null;

  return (
    <Stack
      width="100%"
      minHeight={66}
      direction="row"
      spacing={2}
      justifyContent="space-between"
    >
      <Stack minHeight={66} spacing={2} width="100%">
        <Stack direction="row" justifyContent="space-between">
          <Typography>{label}</Typography>
          <Stack direction="row" spacing="30px">
            <Typography>Start Date: {startDate}</Typography>
            {endDate}
          </Stack>
        </Stack>
        <Typography>{description}</Typography>
      </Stack>
      <Stack minHeight={66} minWidth="111px">
        {enrolled ? null : <Button buttonType="primary">More Info</Button>}
      </Stack>
    </Stack>
  );
}

export default BetaDetails;
