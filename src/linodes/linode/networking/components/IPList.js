import React, { PropTypes } from 'react';

import { Checkbox } from '~/components/form';
import { Table } from '~/components/tables';
import {
  CheckboxCell,
  IPRdnsCell,
} from '~/components/tables/cells';


export default function IPList(props) {
  const { linode, checked, onChange } = props;
  const transferableIps = linode._ips.ipv4.public;

  return (
    <div>
      <Table
        columns={[
          { cellComponent: CheckboxCell, onChange: (ip) => { onChange(ip.address); } },
          { cellComponent: IPRdnsCell },
          { dataKey: 'address', label: 'IP Address' },
        ]}
        data={transferableIps}
        selected={checked}
      />
    </div>
  );
}

IPList.propTypes = {
  linode: PropTypes.object.isRequired,
  checked: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
