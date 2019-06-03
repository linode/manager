import { WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import { formatRegion } from 'src/utilities';

type ClassNames = 'root' | 'section';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    section: {
      marginBottom: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      borderBottom: `1px solid ${theme.palette.divider}`
    }
  });

interface Props {
  open: boolean;
  ip?: Linode.IPAddress;
  onClose: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ViewIPDrawer: React.StatelessComponent<CombinedProps> = props => {
  const { classes } = props;

  return (
    <Drawer open={props.open} onClose={props.onClose} title={`Details for IP`}>
      {props.ip && (
        <React.Fragment>
          <div className={classes.section} data-qa-ip-address-heading>
            <Typography variant="h3">Address</Typography>
            <Typography variant="body1" data-qa-ip-address>
              {props.ip.address}
            </Typography>
          </div>

          <div className={classes.section} data-qa-gateway-heading>
            <Typography variant="h3">Gateway</Typography>
            <Typography variant="body1" data-qa-gateway>
              {props.ip.gateway}
            </Typography>
          </div>

          <div className={classes.section} data-qa-subnet-heading>
            <Typography variant="h3">Subnet Mask</Typography>
            <Typography variant="body1" data-qa-subnet>
              {props.ip.subnet_mask}
            </Typography>
          </div>

          <div className={classes.section} data-qa-type-heading>
            <Typography variant="h3">Type</Typography>
            <Typography variant="body1" data-qa-type>
              {props.ip.type}
            </Typography>
          </div>

          <div className={classes.section} data-qa-public-heading>
            <Typography variant="h3">Public</Typography>
            <Typography variant="body1" data-qa-public>
              {props.ip.public ? 'Yes' : 'No'}
            </Typography>
          </div>

          {props.ip.rdns && (
            <div className={classes.section} data-qa-rdns-heading>
              <Typography variant="h3">RDNS</Typography>
              <Typography variant="body1" data-qa-rdns>
                {props.ip.rdns}
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
              {formatRegion(props.ip.region)}
            </Typography>
          </div>

          <ActionsPanel>
            <Button type="secondary" onClick={props.onClose} data-qa-cancel>
              Close
            </Button>
          </ActionsPanel>
        </React.Fragment>
      )}
    </Drawer>
  );
};

const styled = withStyles(styles);

export default styled(ViewIPDrawer);
