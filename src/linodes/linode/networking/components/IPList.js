import React, { PropTypes } from 'react';

import { Checkbox } from '~/components/form';
import SecondaryTable from '~/components/SecondaryTable';

export default function IPList(props) {
  const { linode, checked, onChange } = props;

  const transferableIps = linode._ips.ipv4.public;
  const rows = transferableIps.map(ip => ({
    address: (
      <div>
        <Checkbox
          className="SecondaryTable-rowSelector"
          onChange={() => onChange(ip.address)}
          id={ip.address}
          checked={checked[ip.address] || false}
          label={`${ip.address}${ip.rdns ? ` (${ip.rdns})` : ''}`}
        />
      </div>
    ),
  }));

  return (
    <div>
      <SecondaryTable
        labels={['IP Address', '']}
        keys={['address', '']}
        rows={rows}
      />
    </div>
  );
}

IPList.propTypes = {
  linode: PropTypes.object.isRequired,
  checked: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
