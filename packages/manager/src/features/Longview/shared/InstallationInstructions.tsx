import { styled, useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';

interface Props {
  APIKey: string;
  installationKey: string;
}

export const InstallationInstructions = React.memo((props: Props) => {
  const theme = useTheme();

  const command = `curl -s https://lv.linode.com/${props.installationKey} | sudo bash`;

  return (
    <Grid sx={{ ...sxContainer }}>
      <Grid sx={{ ...sxItem }}>
        <Typography>
          Before this client can gather data, you need to install the Longview
          Agent on your server by running the following command. After
          installation, it may be a few minutes before the client begins
          receiving data.
        </Typography>
      </Grid>
      <Grid sx={{ ...sxItem }} xs={12}>
        <StyledContainerGrid>
          <Grid sx={{ ...sxItem, paddingTop: 0, paddingBottom: 0 }}>
            <CopyTooltip text={command} />
          </Grid>
          <Grid
            sx={{
              ...sxItem,
              paddingTop: 0,
              paddingBottom: 0,
              overflowX: 'auto',
            }}
          >
            <pre>
              <code>{command}</code>
            </pre>
          </Grid>
        </StyledContainerGrid>
      </Grid>
      <Grid sx={{ ...sxItem }} xs={12}>
        <Typography>
          This should work for most installations, but if you have issues,
          please consult our troubleshooting guide and manual installation
          instructions (API key required):
        </Typography>
      </Grid>
      <Grid sx={{ ...sxItem }} xs={12}>
        <Grid sx={{ ...sxContainer }}>
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
              <span style={{ color: theme.color.grey1 }}>{props.APIKey}</span>
            </Typography>
          </StyledInstructionGrid>
        </Grid>
      </Grid>
    </Grid>
  );
});

const sxItem = {
  boxSizing: 'border-box',
  margin: '0',
};

const sxContainer = {
  boxSizing: 'border-box',
  display: 'flex',
  flexWrap: 'wrap',
  width: '100%',
};

const StyledInstructionGrid = styled(Grid, { label: 'StyledInstructionGrid' })(
  ({ theme }) => ({
    [theme.breakpoints.up('sm')]: {
      '&:not(:first-of-type)': {
        '&:before': {
          content: "'|'",
          left: `calc(-${theme.spacing(1)} + 2px)`,
          position: 'absolute',
          top: `calc(${theme.spacing(1)} - 3px)`,
        },
        marginLeft: theme.spacing(2),
        paddingLeft: theme.spacing(2),
        position: 'relative',
      },
      width: 'auto',
    },
    width: '100%',
    boxSizing: 'border-box',
    margin: '0',
  })
);

const StyledContainerGrid = styled(Grid, { label: 'StyledContainerGrid' })(
  ({ theme }) => ({
    alignItems: 'center',
    backgroundColor: theme.color.grey5,
    borderRadius: theme.shape.borderRadius,
    boxSizing: 'border-box',
    display: 'flex',
    flexWrap: 'wrap',
    margin: `${theme.spacing(1)} 0`,
    maxWidth: '100%',
    wrap: 'noWrap',
  })
);
