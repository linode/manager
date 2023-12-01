import { IPRange } from '@linode/api-v4/lib/networking';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Drawer } from 'src/components/Drawer';
import { Typography } from 'src/components/Typography';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useAllIPsQuery } from 'src/queries/linodes/networking';

import { listIPv6InRange } from './LinodeIPAddressRow';

interface Props {
  linodeId: number;
  onClose: () => void;
  open: boolean;
  selectedRange: IPRange | undefined;
}

export const ViewRDNSDrawer = (props: Props) => {
  const { linodeId, onClose, open, selectedRange } = props;

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
    <Drawer onClose={onClose} open={open} title={`View Reverse DNS`}>
      <div>
        {ips.map((ip) => {
          return (
            <StyledDiv key={ip.address}>
              <Typography>{ip.address}</Typography>
              <Typography>{ip.rdns || ''}</Typography>
            </StyledDiv>
          );
        })}
      </div>
    </Drawer>
  );
};

const StyledDiv = styled('div', { label: 'StyledDiv' })(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));
