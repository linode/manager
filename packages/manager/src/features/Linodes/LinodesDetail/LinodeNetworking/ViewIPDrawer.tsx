import { IPAddress } from '@linode/api-v4/lib/networking';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import Drawer from 'src/components/Drawer';
import { Typography } from 'src/components/Typography';
import { useRegionsQuery } from 'src/queries/regions';

const useStyles = makeStyles()((theme: Theme) => ({
  section: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

interface Props {
  ip?: IPAddress;
  onClose: () => void;
  open: boolean;
}

export const ViewIPDrawer = (props: Props) => {
  const { classes } = useStyles();
  const { ip } = props;

  const { data: regions } = useRegionsQuery();

  const actualRegion = regions?.find((r) => r.id === ip?.region);

  return (
    <Drawer onClose={props.onClose} open={props.open} title={`Details for IP`}>
      {ip && (
        <React.Fragment>
          <div className={classes.section} data-qa-ip-address-heading>
            <Typography variant="h3">Address</Typography>
            <Typography data-qa-ip-address variant="body1">
              {ip.address}
            </Typography>
          </div>

          <div className={classes.section} data-qa-gateway-heading>
            <Typography variant="h3">Gateway</Typography>
            <Typography data-qa-gateway variant="body1">
              {ip.gateway}
            </Typography>
          </div>

          <div className={classes.section} data-qa-subnet-heading>
            <Typography variant="h3">Subnet Mask</Typography>
            <Typography data-qa-subnet variant="body1">
              {ip.subnet_mask}
            </Typography>
          </div>

          <div className={classes.section} data-qa-type-heading>
            <Typography variant="h3">Type</Typography>
            <Typography data-qa-type variant="body1">
              {ip.type}
            </Typography>
          </div>

          <div className={classes.section} data-qa-public-heading>
            <Typography variant="h3">Public</Typography>
            <Typography data-qa-public variant="body1">
              {ip.public ? 'Yes' : 'No'}
            </Typography>
          </div>

          {ip.rdns && (
            <div className={classes.section} data-qa-rdns-heading>
              <Typography variant="h3">RDNS</Typography>
              <Typography data-qa-rdns variant="body1">
                {ip.rdns}
              </Typography>
            </div>
          )}

          <div
            className={classes.section}
            data-qa-region-heading
            style={{ border: 0, paddingBottom: 0 }}
          >
            <Typography variant="h3">Region</Typography>
            <Typography data-qa-region variant="body1">
              {actualRegion?.label ?? ip.region}
            </Typography>
          </div>

          <ActionsPanel>
            <Button
              buttonType="secondary"
              data-qa-cancel
              onClick={props.onClose}
            >
              Close
            </Button>
          </ActionsPanel>
        </React.Fragment>
      )}
    </Drawer>
  );
};
