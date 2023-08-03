import * as React from 'react';

import { Beta } from '@linode/api-v4/lib/betas';
import { AccountBeta } from '@linode/api-v4/lib/account';

import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { Divider } from 'src/components/Divider';

import BetaDetails from './BetaDetails';

interface Props {
  title: string;
  betas: (Beta | AccountBeta)[];
}

const BetaDetailsList = (props: Props) => {
  const { title, betas } = props;
  return (
    <Paper>
      <Typography variant="h2">{title}</Typography>
      <Divider />
      <ul>
        {betas.map((beta) => (
          <>
            <BetaDetails beta={beta} />
            <Divider />
          </>
        ))}
      </ul>
    </Paper>
  );
};

export default BetaDetailsList;
