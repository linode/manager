import React, { PropTypes } from 'react';

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
        className='Table--secondary'
        columns={[
          {
            cellComponent: CheckboxCell,
            onChange: (record) => { onChange(record); }
          },
          {
            cellComponent: IPRdnsCell,
            label: 'IP Address'
          },
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
