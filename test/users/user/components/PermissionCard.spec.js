import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { PermissionCard } from '~/users/user/components/PermissionCard';

describe('users/user/components/PermissionCard', () => {
  it('renders permission card', () => {
    const page = mount(
      <PermissionCard
        title="The Title"
        parentKey="linode"
        onCellChange={() => {}}
        objects={[
          {
            all: true,
            access: true,
            id: 123,
            label: 'lnd1',
          },
        ]}
        columns={[
          { dataKey: 'all', label: 'All' },
          { dataKey: 'access', label: 'Access' },
        ]}
      />
    );

    const header = page.find('h2').at(0);
    expect(header.text()).to.equal('The Title permissions');
    const th = page.find('th');
    expect(th.at(0).text()).to.equal('The Title');
    expect(th.at(1).text()).to.equal('All');
    expect(th.at(2).text()).to.equal('Access');
    const td = page.find('.TableRow').at(0).find('td');
    expect(td.at(0).text()).to.equal('lnd1');
    expect(td.at(1).find('input').at(0)
        .props().checked).to.equal(true);
    expect(td.at(2).find('input').at(0)
        .props().checked).to.equal(true);
  });
});
