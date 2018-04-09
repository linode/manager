import PropTypes from 'prop-types';
import React from 'react';
import Table from 'linode-components/dist/tables/Table';
import CheckboxCell from 'linode-components/dist/tables/cells/CheckboxCell';

import { IPRdnsCell } from '~/components/tables/cells';


export default function IPList(props) {
  const { linode, checked, onChange } = props;
  const ips = linode._ips;

  if (!ips) return null;

  const transferableIps = Object.values(ips).filter(
    ip => ip.type === 'ipv4' && ip.public);

  return (
    <div>
      <Table
        className="Table--secondary"
        columns={[
          {
            cellComponent: CheckboxCell,
            headerClassName: 'CheckboxColumn',
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
