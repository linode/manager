import { Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';
import * as React from 'react';

import Community from 'src/assets/icons/community.svg';
import Documentation from 'src/assets/icons/document.svg';
import Status from 'src/assets/icons/status.svg';
import Support from 'src/assets/icons/support.svg';
import { Tile } from 'src/components/Tile/Tile';

export const OtherWays = () => {
  const theme = useTheme();

  return (
    <React.Fragment>
      <Typography
        sx={{
          marginBottom: theme.spacing(4),
          textAlign: 'center',
        }}
        variant="h2"
      >
        Other Ways to Get Help
      </Typography>
      <Grid container spacing={2} sx={{ marginTop: theme.spacing(2) }}>
        <Grid
          size={{
            sm: 6,
            xs: 12,
          }}
        >
          <Tile
            description="View Linode and Linux guides and tutorials for all experience levels."
            icon={<Documentation />}
            link="https://linode.com/docs/"
            title="Guides and Tutorials"
          />
        </Grid>
        <Grid
          size={{
            sm: 6,
            xs: 12,
          }}
        >
          <Tile
            description="Ask questions, find answers, and connect with other members of the Linode Community."
            icon={<Community />}
            link="https://linode.com/community/questions"
            title="Community Q&A"
          />
        </Grid>
        <Grid
          size={{
            sm: 6,
            xs: 12,
          }}
        >
          <Tile
            description="Get updates on Linode incidents and maintenance"
            icon={<Status />}
            link="https://status.linode.com"
            title="Linode Status Page"
          />
        </Grid>
        <Grid
          size={{
            sm: 6,
            xs: 12,
          }}
        >
          <Tile
            description="View or open Linode Support tickets."
            icon={<Support />}
            link="/support/tickets"
            title="Customer Support"
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
