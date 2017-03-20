import React from 'react';

import { StyleguideSection } from '~/styleguide/components';
import { Table } from '~/components/tables';
import {
  ButtonCell,
  CheckboxCell,
  LinkCell,
} from '~/components/tables/cells';


export default function Lists() {
  return (
    <StyleguideSection name="modals" title="Lists">
      <div className="StyleguideLists col-sm-12">
        <div className="StyleguideSubSection row">
          <div className="col-sm-12">
            <div className="StyleguideSubSection-header">
              <p>
              </p>
            </div>
            <div className="StyleguideLists-example">
              <p>Basic List Example:</p>
              <Table
                columns={[
                  { className: 'RowLabelCell', dataKey: 'label', label: 'Linode' },
                  { dataKey: 'ip_address', label: 'IP address' },
                  { dataKey: 'datacenter', label: 'Datacenter' },
                ]}
                data={[
                  { label: 'linode-1', ip_address: '192.168.0.0', datacenter: 'Huston, TX' },
                  { label: 'linode-2', ip_address: '192.168.0.0', datacenter: 'Huston, TX' },
                  { label: 'linode-3', ip_address: '192.168.0.0', datacenter: 'Huston, TX' },
                ]}
              />
            </div>
            <div className="StyleguideLists-example">
              <p>List with selection, links, and actions example:</p>
              <Table
                columns={[
                  { cellComponent: CheckboxCell, onChange: () => {} },
                  {
                    className: 'RowLabelCell',
                    cellComponent: LinkCell,
                    dataKey: 'label',
                    label: 'Linode',
                    hrefFn: () => { return '#'; },
                  },
                  { dataKey: 'ip_address', label: 'IP address' },
                  { dataKey: 'datacenter', label: 'Datacenter' },
                  { cellComponent: ButtonCell, text: 'Edit' },
                ]}
                data={[
                  { label: 'linode-1', ip_address: '192.168.0.0', datacenter: 'Huston, TX' },
                  { label: 'linode-2', ip_address: '192.168.0.0', datacenter: 'Huston, TX' },
                  { label: 'linode-3', ip_address: '192.168.0.0', datacenter: 'Huston, TX' },
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </StyleguideSection>
  );
}
