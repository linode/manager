import { AccountBeta } from '@linode/api-v4/lib/account';
import { Beta } from '@linode/api-v4/lib/betas';
import { Stack } from 'src/components/Stack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Button } from 'src/components/Button/Button';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';

interface Props {
  beta: AccountBeta | Beta;
}

const BetaDetails = (props: Props) => {
  const history = useHistory();
  let more_info = undefined;
  let enrolled = undefined;
  if ('more_info' in props.beta) {
    more_info = props.beta.more_info;
  }
  if ('enrolled' in props.beta) {
    enrolled = props.beta.enrolled;
  }
  const {
    beta: { description, ended, id, label, started },
  } = props;
  const startDate = !enrolled ? (
    <Typography>
      <strong>Start Date: </strong>
      <DateTimeDisplay displayTime={false} value={started} />
    </Typography>
  ) : null;
  const endDate = ended ? (
    <Typography>
      <strong>End Date: </strong>
      <DateTimeDisplay displayTime={false} value={ended} />
    </Typography>
  ) : null;

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      minHeight={66}
      spacing={2}
      width="100%"
    >
      <Stack minHeight={66} spacing={2} width="100%">
        <Stack direction="row" justifyContent="space-between">
          <Typography>
            <strong>{label}</strong>
          </Typography>
          <Stack direction="row" spacing="30px">
            {startDate}
            {endDate}
          </Stack>
        </Stack>
        <Typography>{description}</Typography>
      </Stack>
      <Stack direction="column" minHeight={66} minWidth="111px" spacing={2}>
        {enrolled ? null : (
          <Button
            onClick={() => {
              history.push('/betas/signup', { betaId: id });
            }}
            buttonType="primary"
          >
            Sign Up
          </Button>
        )}
        {more_info ? (
          <Link external to={more_info}>
            More Info
          </Link>
        ) : null}
      </Stack>
    </Stack>
  );
};

export default BetaDetails;
