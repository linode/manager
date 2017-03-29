import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { PermissionCard } from '~/users/user/components/PermissionCard';

describe('users/user/components/PermissionCard', () => {
  it('renders permission card', () => {
    const page = mount(
      <PermissionCard
        updateGlobal={() => {}}
        title="The Title"
        section="tester"
        addLabel="details here"
        addCheck={false}
      />
    );

    const header = page.find('h2').at(0);
    expect(header.text()).to.equal('The Title');
    const label = page.find('label').at(0);
    expect(label.text()).to.equal('details here');
    const checkbox = page.find('#permission-global-tester');
    expect(checkbox.props().checked).to.equal(false);
  });
});
