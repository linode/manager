import { IPRange } from '@linode/api-v4/lib/networking';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useAllIPsQuery } from 'src/queries/linodes/networking';
import { listIPv6InRange } from './LinodeNetworking';

const useStyles = makeStyles()((theme: Theme) => ({
  rdnsListItem: {
    marginBottom: theme.spacing(2),
  },
}));

interface Props {
  open: boolean;
  onClose: () => void;
  linodeId: number;
  selectedRange: IPRange | undefined;
}

const ViewRDNSDrawer = (props: Props) => {
  const { linodeId, onClose, open, selectedRange } = props;
  const { classes } = useStyles();

  const { data: linode } = useLinodeQuery(linodeId, open);

  const { data: ipsInRegion } = useAllIPsQuery(
    {},
    {
      region: linode?.region,
    },
    linode !== undefined && open
  );

  // @todo in the future use an API filter insted of `listIPv6InRange` ARB-3785
  const ips = selectedRange
    ? listIPv6InRange(selectedRange.range, selectedRange.prefix, ipsInRegion)
    : [];

  return (
    <Drawer open={open} onClose={onClose} title={`View Reverse DNS`}>
      <div>
        {ips.map((ip) => {
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
