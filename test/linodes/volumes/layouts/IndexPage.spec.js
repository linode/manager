import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { SHOW_MODAL } from '~/actions/modal';
import { IndexPage } from '~/linodes/volumes/layouts/IndexPage';

import { api } from '@/data';
import {
  expectRequest,
} from '@/common.js';


const { volumes } = api;

describe('linodes/volumes/layouts/IndexPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders a list of volumes', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        selectedMap={{}}
        volumes={volumes}
      />
    );

    const vol = page.find('.TableRow');
    // + 1 for the group
    expect(vol.length).to.equal(Object.keys(volumes.volumes).length);
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
      <IndexPage
        dispatch={dispatch}
        selectedMap={{}}
        volumes={volumes}
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
      <IndexPage
        dispatch={dispatch}
        selectedMap={{ 1: true }}
        volumes={volumes}
      />
    );

    dispatch.reset();

    const actions = page.find('MassEditControl').find('Dropdown').props().groups[0].elements;
    actions.find(a => a && a.name === 'Delete').action();

    const modal = mount(dispatch.firstCall.args[0].body);
    console.log(modal.debug());
    dispatch.reset();
    modal.find('Form').props().onSubmit({ preventDefault() {} });

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/linode/volumes/38', { method: 'DELETE' });
  });
});
