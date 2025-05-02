import { Button, Stack, Typography } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Link } from 'src/components/Link';

import type { AccountBeta, Beta } from '@linode/api-v4';

interface Props {
  beta: AccountBeta | Beta;
  dataQA: string;
}

const BetaDetails = (props: Props) => {
  const navigate = useNavigate();
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
    dataQA,
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
      data-qa-beta-details={dataQA}
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
            buttonType="primary"
            onClick={() => {
              navigate({ params: { betaId: id }, to: '/betas/signup/$betaId' });
            }}
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
