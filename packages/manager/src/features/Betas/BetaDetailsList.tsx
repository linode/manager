import { AccountBeta } from '@linode/api-v4/lib/account';
import { Beta } from '@linode/api-v4/lib/betas';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { Divider } from 'src/components/Divider';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';

import BetaDetails from './BetaDetails';

import type { FormattedAPIError } from 'src/types/FormattedAPIError';

interface Props {
  betas: (AccountBeta | Beta)[];
  errors: FormattedAPIError[] | null;
  isLoading: boolean;
  title: string;
}

const BetaError = (props: { errors: FormattedAPIError[] | null }) =>
  props.errors ? (
    <ErrorState errorText={props.errors[0].formattedReason} />
  ) : null;

export const BetaDetailsList = (props: Props) => {
  const { betas, errors, isLoading, title } = props;
  return (
    <Paper>
      <Typography variant="h2">{title}</Typography>
      <Divider spacingBottom={20} spacingTop={20} />
      <BetaError errors={errors} />
      {isLoading && <CircleProgress />}
      <Stack divider={<Divider spacingBottom={20} spacingTop={20} />}>
        {betas.map((beta, index) => (
          <BetaDetails beta={beta} key={`${index}-${beta.id}`} />
        ))}
      </Stack>
    </Paper>
  );
};
