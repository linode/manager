// TODO: GAHHH this page needs to know all other linodes' ips not the current one

import React, { PropTypes } from 'react';

import { Card } from '~/components/cards';
import SecondaryTable from '~/components/SecondaryTable';

export default function IPSharing(props) {
  const { dispatch, linodes } = props;

  const { _ips: ips } = linodes;
  // TODO: Wrapper for slaac address until the API gives back the full object
  const slaac = { address: ips.ipv6.slaac };
  const shareableIps = [...ips.ipv4.public, slaac, ...ips.ipv6.addresses];
  const rows = shareableIps.map(ip => ({
    address: ip.address,
    linode: <Link to={`/linodes/${}`}
  }));

  return (
    <Card title="IP Sharing">
      <SecondaryTable
        labels={['IP Address', 'Linode', '']}
        keys={['address', 'linode', 'nav']}
        rows={rows}
      />
    </Card>
  );
}

IPSharing.propTypes = {
  linode: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};
