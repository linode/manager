import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import {
  StyledContainerGrid,
  StyledInstructionGrid,
} from './InstallationInstructions.styles';

interface Props {
  APIKey: string;
  installationKey: string;
}

export const InstallationInstructions = React.memo((props: Props) => {
  const command = `curl -s https://lv.linode.com/${props.installationKey} | sudo bash`;

  return (
    <Grid container spacing={2}>
      <Grid>
        <Typography>
          Before this client can gather data, you need to install the Longview
          Agent on your server by running the following command. After
          installation, it may be a few minutes before the client begins
          receiving data.
        </Typography>
      </Grid>
      <Grid xs={12}>
        <StyledContainerGrid spacing={2}>
          <Grid sx={{ padding: '8px' }}>
            <CopyTooltip text={command} />
          </Grid>
          <Grid
            sx={{
              paddingTop: 0,
              paddingBottom: 0,
              paddingLeft: '8px',
              overflowX: 'auto',
            }}
          >
            <pre>
              <code>{command}</code>
            </pre>
          </Grid>
        </StyledContainerGrid>
      </Grid>
      <Grid xs={12}>
        <Typography>
          This should work for most installations, but if you have issues,
          please consult our troubleshooting guide and manual installation
          instructions (API key required):
        </Typography>
      </Grid>
      <Grid xs={12}>
        <Grid container spacing={2}>
          <StyledInstructionGrid>
            <Typography>
              <Link to="https://www.linode.com/docs/platform/longview/troubleshooting-linode-longview/">
                Troubleshooting guide
              </Link>
            </Typography>
          </StyledInstructionGrid>
          <StyledInstructionGrid>
            <Typography>
              <Link to="https://www.linode.com/docs/platform/longview/what-is-longview/#install-the-longview-agent">
                Manual installation instructions
              </Link>
            </Typography>
          </StyledInstructionGrid>
          <StyledInstructionGrid>
            <Typography data-testid="api-key">
              API Key:{' '}
              <Box
                component="span"
                sx={(theme) => ({ color: theme.color.grey1 })}
              >
                {props.APIKey}
              </Box>
            </Typography>
          </StyledInstructionGrid>
        </Grid>
      </Grid>
    </Grid>
  );
});
