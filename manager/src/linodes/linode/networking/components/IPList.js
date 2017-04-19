import React, { PropTypes } from 'react';

import { Table } from 'linode-components/tables';
import { CheckboxCell } from 'linode-components/tables/cells';
import { IPRdnsCell } from '~/components/tables/cells';


export default function IPList(props) {
  const { linode, checked, onChange } = props;
  const transferableIps = linode._ips.ipv4.public;

  return (
    <div>
      <Table
        className="Table--secondary"
        columns={[
          {
            cellComponent: CheckboxCell,
            selectedKey: 'address',
          },
          {
            cellComponent: IPRdnsCell,
            label: 'IP Address',
          },
        ]}
        data={transferableIps}
        selectedMap={checked}
        onToggleSelect={(record, checked) => {
          onChange(record, checked);
        }}
      />
    </div>
  );
}

IPList.propTypes = {
  linode: PropTypes.object.isRequired,
  checked: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
