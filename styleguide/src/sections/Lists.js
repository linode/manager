import React from 'react';

import { StyleguideSection } from '../components';
import { Table } from 'linode-components/tables';
import {
  ButtonCell,
  CheckboxCell,
  LabelCell,
  LinkCell,
} from 'linode-components/tables/cells';


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
                  {
                    cellComponent: LabelCell,
                    headerClassName: 'LabelColumn',
                    dataKey: 'label',
                    label: 'Linode',
                    tooltipEnabled: true,
                  },
                  { dataKey: 'ip_address', label: 'IP address' },
                  { dataKey: 'region', label: 'Region' },
                ]}
                data={[
                  { label: 'linode-1', ip_address: '192.168.0.0', region: 'Huston, TX' },
                  { label: 'linode-2', ip_address: '192.168.0.0', region: 'Huston, TX' },
                  { label: 'linode-3', ip_address: '192.168.0.0', region: 'Huston, TX' },
                ]}
              />
            </div>
            <div className="StyleguideLists-example">
              <p>List with selection, links, and actions example:</p>
              <Table
                columns={[
                  { cellComponent: CheckboxCell, headerClassName: 'CheckboxColumn', onChange: () => {} },
                  {
                    className: 'LabelCell',
                    headerClassName: 'LabelColumn',
                    cellComponent: LinkCell,
                    dataKey: 'label',
                    label: 'Linode',
                    hrefFn: () => { return '#'; },
                  },
                  { dataKey: 'ip_address', label: 'IP address' },
                  { dataKey: 'region', label: 'Region' },
                  { cellComponent: ButtonCell, headerClassName: 'ButtonColumn', text: 'Edit' },
                ]}
                data={[
                  { label: 'linode-1', ip_address: '192.168.0.0', region: 'Huston, TX' },
                  { label: 'linode-2', ip_address: '192.168.0.0', region: 'Huston, TX' },
                  { label: 'linode-3', ip_address: '192.168.0.0', region: 'Huston, TX' },
                ]}
                selectedMap={{}}
              />
            </div>
          </div>
        </div>
      </div>
    </StyleguideSection>
  );
}
