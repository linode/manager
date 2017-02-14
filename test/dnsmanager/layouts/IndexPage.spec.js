import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import { IndexPage } from '~/dnsmanager/layouts/IndexPage';
import { api } from '@/data';
import { SHOW_MODAL } from '~/actions/modal';

const { dnszones } = api;

describe('dnsmanager/layouts/IndexPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders a list of DNS Zones', () => {
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        selected={{}}
        dnszones={dnszones}
      />
    );

    const zone = page.find('.PrimaryTable-row');
    // + 1 for the group
    expect(zone.length).to.equal(Object.keys(dnszones.dnszones).length + 1);
    const firstZone = zone.at(1);
    expect(firstZone.find('Link').props().to)
      .to.equal('/dnsmanager/example.com');
    expect(firstZone.find('td').at(1).text())
      .to.equal('master zone');
  });

  it('shows the delete modal when delete is pressed', () => {
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        selected={{}}
        dnszones={dnszones}
      />
    );

    const zoneDelete = page.find('.PrimaryTable-row Button').at(0);
    dispatch.reset();
    zoneDelete.simulate('click');
    expect(dispatch.callCount).to.equal(1);
    expect(dispatch.firstCall.args[0])
      .to.have.property('type').which.equals(SHOW_MODAL);
  });
});
