import { IPAddress } from '@linode/api-v4/lib/networking';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import { useRegionsQuery } from 'src/queries/regions';

const useStyles = makeStyles()((theme: Theme) => ({
  section: {
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

interface Props {
  open: boolean;
  ip?: IPAddress;
  onClose: () => void;
}

export const ViewIPDrawer = (props: Props) => {
  const { classes } = useStyles();
  const { ip } = props;

  const { data: regions } = useRegionsQuery();

  const actualRegion = regions?.find((r) => r.id === ip?.region);

  return (
    <Drawer open={props.open} onClose={props.onClose} title={`Details for IP`}>
      {ip && (
        <React.Fragment>
          <div className={classes.section} data-qa-ip-address-heading>
            <Typography variant="h3">Address</Typography>
            <Typography variant="body1" data-qa-ip-address>
              {ip.address}
            </Typography>
          </div>

          <div className={classes.section} data-qa-gateway-heading>
            <Typography variant="h3">Gateway</Typography>
            <Typography variant="body1" data-qa-gateway>
              {ip.gateway}
            </Typography>
          </div>

          <div className={classes.section} data-qa-subnet-heading>
            <Typography variant="h3">Subnet Mask</Typography>
            <Typography variant="body1" data-qa-subnet>
              {ip.subnet_mask}
            </Typography>
          </div>

          <div className={classes.section} data-qa-type-heading>
            <Typography variant="h3">Type</Typography>
            <Typography variant="body1" data-qa-type>
              {ip.type}
            </Typography>
          </div>

          <div className={classes.section} data-qa-public-heading>
            <Typography variant="h3">Public</Typography>
            <Typography variant="body1" data-qa-public>
              {ip.public ? 'Yes' : 'No'}
            </Typography>
          </div>

          {ip.rdns && (
            <div className={classes.section} data-qa-rdns-heading>
              <Typography variant="h3">RDNS</Typography>
              <Typography variant="body1" data-qa-rdns>
                {ip.rdns}
              </Typography>
            </div>
          )}

          <div
            className={classes.section}
            style={{ border: 0, paddingBottom: 0 }}
            data-qa-region-heading
          >
            <Typography variant="h3">Region</Typography>
            <Typography variant="body1" data-qa-region>
              {actualRegion?.label ?? ip.region}
            </Typography>
          </div>

          <ActionsPanel>
            <Button
              buttonType="secondary"
              onClick={props.onClose}
              data-qa-cancel
            >
              Close
            </Button>
          </ActionsPanel>
        </React.Fragment>
      )}
    </Drawer>
  );
};
