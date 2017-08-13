import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { SHOW_MODAL } from '~/actions/modal';
import { VolumesList } from '~/linodes/volumes/components';

import { changeInput, expectRequest } from '@/common.js';
import { api } from '@/data';


const { volumes: { volumes } } = api;

describe('linodes/volumes/layouts/VolumesList', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders a list of volumes', () => {
    const page = mount(
      <VolumesList
        dispatch={dispatch}
        selectedMap={{}}
        volumes={volumes}
        objectType="volumes"
      />
    );

    const vol = page.find('.TableRow');
    // + 1 for the group
    expect(vol.length).to.equal(Object.keys(volumes).length);
    const firstVol = vol.at(0);
    expect(firstVol.find('td').at(1).text())
      .to.equal('test');
    expect(firstVol.find('td').at(2).text())
      .to.equal('20 GiB');
    expect(firstVol.find('td').at(3).text())
      .to.equal('us-east-1a');
    expect(firstVol.find('td').at(4).text())
      .to.equal('Unattached');
  });

  it('shows the delete modal when delete is pressed', () => {
    const page = mount(
      <VolumesList
        dispatch={dispatch}
        selectedMap={{}}
        volumes={volumes}
        objectType="volumes"
      />
    );

    const volDelete = page.find('.TableRow Button').at(0);
    dispatch.reset();
    volDelete.simulate('click');
    expect(dispatch.callCount).to.equal(1);
    expect(dispatch.firstCall.args[0])
      .to.have.property('type').which.equals(SHOW_MODAL);
  });

  it('deletes selected volumes when delete is pressed', async () => {
    const page = mount(
      <VolumesList
        dispatch={dispatch}
        selectedMap={{ 38: true }}
        volumes={volumes}
        objectType="volumes"
      />
    );

    dispatch.reset();
    page.find('MassEditControl').find('Dropdown').props().groups[0].elements[0].action();

    const modal = mount(dispatch.firstCall.args[0].body);

    dispatch.reset();
    modal.find('Form').props().onSubmit();
    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/linode/volumes/38', { method: 'DELETE' });
  });
});
