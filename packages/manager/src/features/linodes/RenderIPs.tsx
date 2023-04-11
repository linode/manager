import * as React from 'react';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Unstable_Grid2';

export interface Props {
  ipv4: string[];
  ipv6: string | null;
  linodeId: number;
}

type CombinedProps = Props;

export const RenderIPs: React.FC<CombinedProps> = (props) => {
  const { ipv4, ipv6, linodeId } = props;

  const ipv4ShouldTruncate = ipv4.length > 4;
  const ipv4Slice = ipv4ShouldTruncate ? ipv4.slice(0, 3) : ipv4;

  return (
    <>
      {ipv4Slice.map((thisIP) => {
        return (
          <Grid key={thisIP} data-testid="ipv4-list-">
            {thisIP}
          </Grid>
        );
      })}
      {ipv6 && <Grid>{ipv6}</Grid>}
      {ipv4ShouldTruncate ? (
        <Grid>
          ... plus{' '}
          <Link
            to={`/linodes/${linodeId}/networking`}
            data-testid="truncated-ips"
          >
            {ipv4.length - 3} more
          </Link>{' '}
        </Grid>
      ) : null}
    </>
  );
};

export default React.memo(RenderIPs);
