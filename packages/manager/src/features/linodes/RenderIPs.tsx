import * as React from 'react';
import { Link } from 'react-router-dom';
import ListItem from 'src/components/core/ListItem';

export interface Props {
  ipv4: string[];
  ipv6: string | null;
  linodeId: number;
}

type CombinedProps = Props;

export const RenderIPs: React.FC<CombinedProps> = props => {
  const { ipv4, ipv6, linodeId } = props;

  const ipv4ShouldTruncate = ipv4.length > 4;
  const ipv4Slice = ipv4ShouldTruncate ? ipv4.slice(0, 3) : ipv4.slice(0);

  return (
    <>
      {ipv4Slice.map(thisIP => {
        return (
          <ListItem key={thisIP} data-testid="ipv4-list-item">
            {thisIP}
          </ListItem>
        );
      })}
      {ipv6 && <ListItem>{ipv6}</ListItem>}
      {ipv4ShouldTruncate ? (
        <>
          ... plus{' '}
          <Link
            to={`/linodes/${linodeId}/networking`}
            data-testid="truncated-ips"
          >
            {ipv4.length - 3} more
          </Link>{' '}
        </>
      ) : null}
    </>
  );
};

export default React.memo(RenderIPs);
