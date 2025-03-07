import {
  CircleProgress,
  Divider,
  ErrorState,
  Paper,
  Stack,
  Typography,
} from '@linode/ui';
import * as React from 'react';

import BetaDetails from './BetaDetails';

import type { APIError } from '@linode/api-v4';
import type { AccountBeta } from '@linode/api-v4/lib/account';
import type { Beta } from '@linode/api-v4/lib/betas';

interface Props {
  betas: (AccountBeta | Beta)[];
  dataQA: string;
  errors: APIError[] | null;
  isLoading: boolean;
  title: string;
}

const BetaError = (props: { errors: APIError[] | null }) =>
  props.errors ? <ErrorState errorText={props.errors[0].reason} /> : null;

export const BetaDetailsList = (props: Props) => {
  const { betas, dataQA, errors, isLoading, title } = props;
  return (
    <Paper>
      <Typography variant="h2">{title}</Typography>
      <Divider spacingBottom={20} spacingTop={20} />
      <BetaError errors={errors} />
      {isLoading ? (
        <Stack
          alignItems="center"
          justifyContent="center"
          minHeight={150}
          width="100%"
        >
          <CircleProgress size="md" />
        </Stack>
      ) : (
        <Stack divider={<Divider spacingBottom={20} spacingTop={20} />}>
          {betas.length > 0 ? (
            betas.map((beta, index) => (
              <BetaDetails
                beta={beta}
                dataQA={dataQA}
                key={`${index}-${beta.id}`}
              />
            ))
          ) : (
            <Typography>No betas found</Typography>
          )}
        </Stack>
      )}
    </Paper>
  );
};
