import * as React from 'react';

import Stack from '@mui/material/Stack';
import { Beta } from '@linode/api-v4/lib/betas';
import { AccountBeta } from '@linode/api-v4/lib/account';

import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { Divider } from 'src/components/Divider';

import BetaDetails from './BetaDetails';
import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { APIError } from '@linode/api-v4';

interface Props {
  title: string;
  betas: (Beta | AccountBeta)[];
  isLoading: boolean;
  errors: APIError[] | null;
}

const BetaError = (props: { errors: APIError[] | null }) =>
  props.errors ? <ErrorState errorText={props.errors[0].reason} /> : null;

export const BetaDetailsList = (props: Props) => {
  const { title, betas, isLoading, errors } = props;
  return (
    <Paper>
      <Typography variant="h2">{title}</Typography>
      <Divider spacingBottom={20} spacingTop={20} />
      <BetaError errors={errors} />
      {isLoading && <CircleProgress />}
      <Stack divider={<Divider spacingTop={20} spacingBottom={20} />}>
        {betas.map((beta, index) => (
          <BetaDetails beta={beta} key={`${index}-${beta.id}`} />
        ))}
      </Stack>
    </Paper>
  );
};
