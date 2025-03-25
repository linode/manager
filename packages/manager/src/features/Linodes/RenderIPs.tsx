import Grid from '@mui/material/Grid2';
import * as React from 'react';

import { Link } from 'src/components/Link';

export interface Props {
  ipv4: string[];
  ipv6: null | string;
  linodeId: number;
}

export const RenderIPs = React.memo((props: Props) => {
  const { ipv4, ipv6, linodeId } = props;

  const ipv4ShouldTruncate = ipv4.length > 4;
  const ipv4Slice = ipv4ShouldTruncate ? ipv4.slice(0, 3) : ipv4;

  return (
    <>
      {ipv4Slice.map((thisIP) => {
        return (
          <Grid data-testid="ipv4-list-item" key={thisIP}>
            {thisIP}
          </Grid>
        );
      })}
      {ipv6 && <Grid>{ipv6}</Grid>}
      {ipv4ShouldTruncate ? (
        <Grid>
          ... plus{' '}
          <Link
            data-testid="truncated-ips"
            to={`/linodes/${linodeId}/networking`}
          >
            {ipv4.length - 3} more
          </Link>{' '}
        </Grid>
      ) : null}
    </>
  );
});
