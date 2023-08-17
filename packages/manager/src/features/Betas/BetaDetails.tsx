import * as React from 'react';
import Stack from '@mui/material/Stack';
import { useHistory } from 'react-router-dom';

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
  const history = useHistory();
  const {
    beta: { label, started, description, ended, id },
  } = props;
  const enrolled = props.beta?.enrolled;
  const startDate = (
    <Typography>
      <strong>Start Date: </strong>
      <DateTimeDisplay displayTime={false} value={started} />
    </Typography>
  );
  const endDate = ended ? (
    <Typography>
      <strong>End Date: </strong>
      <DateTimeDisplay displayTime={false} value={ended} />
    </Typography>
  ) : null;
  const enrolledDate = enrolled ? (
    <Typography>
      <strong>Enrolled: </strong>
      <DateTimeDisplay displayTime={false} value={enrolled} />
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
          <Typography>
            <strong>{label}</strong>
          </Typography>
          <Stack direction="row" spacing="30px">
            {startDate}
            {enrolledDate}
            {endDate}
          </Stack>
        </Stack>
        <Typography>{description}</Typography>
      </Stack>
      <Stack minHeight={66} minWidth="111px">
        {enrolled ? null : (
          <Button
            buttonType="primary"
            onClick={() => {
              history.push(`/betas/signup`, { betaId: id });
            }}
          >
            More Info
          </Button>
        )}
      </Stack>
    </Stack>
  );
}

export default BetaDetails;
