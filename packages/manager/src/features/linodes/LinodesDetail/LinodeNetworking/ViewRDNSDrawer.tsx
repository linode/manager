import { IPAddress } from 'linode-js-sdk/lib/networking';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';

const useStyles = makeStyles((theme: Theme) => ({
  rdnsListItem: {
    marginBottom: theme.spacing(2)
  }
}));

interface Props {
  open: boolean;
  onClose: () => void;
  ips: IPAddress[];
}

type CombinedProps = Props;

const ViewRDNSDrawer: React.FC<CombinedProps> = props => {
  const { open, onClose, ips } = props;
  const classes = useStyles();

  return (
    <Drawer open={open} onClose={onClose} title={`View Reverse DNS`}>
      <div>
        {ips.map(ip => {
          return (
            <div key={ip.address} className={classes.rdnsListItem}>
              <Typography>{ip.address}</Typography>
              <Typography>{ip.rdns || ''}</Typography>
            </div>
          );
        })}
      </div>
    </Drawer>
  );
};

export default ViewRDNSDrawer;
