import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import { ConfigPanel } from '~/linodes/linode/settings/components/ConfigPanel';
import { actions } from '~/api/configs/linodes';
import { expectRequest } from '@/common';
import { api } from '@/data';
import { testLinode } from '@/data/linodes';
const { linodes } = api;

describe('linodes/linode/settings/components/ConfigPanel', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('renders config help button', () => {
    const panel = mount(
      <ConfigPanel
        params={{ linodeId: '1239' }}
        dispatch={() => {}}
        linodes={linodes}
      />
    );

    expect(panel.find('HelpButton').length).to.equal(1);
  });

  it('renders add a config button', () => {
    const panel = shallow(
      <ConfigPanel
        params={{ linodeId: '1239' }}
        dispatch={() => {}}
        linodes={linodes}
      />
    );

    expect(panel.find('header Link').props().children).to.equal('Add a config');
    expect(panel.find('header Link').props().to)
      .equal('/linodes/1239/settings/advanced/configs/create');
  });

  it('renders with no config', () => {
    const panel = shallow(
      <ConfigPanel
        params={{ linodeId: '1239' }}
        dispatch={() => {}}
        linodes={linodes}
      />
    );

    expect(panel.find('p').text()).to.equal('No configs yet. Add a config.');
  });

  it('renders multiple configs', () => {
    const panel = shallow(
      <ConfigPanel
        params={{ linodeId: '1238' }}
        dispatch={() => {}}
        linodes={linodes}
      />
    );

    expect(panel.find('tr').length).to.equal(3);
  });

  it('renders config label link', () => {
    const path = '/linodes/1234/settings/advanced/configs/12345';
    const panel = shallow(
      <ConfigPanel
        params={{ linodeId: `${testLinode.id}` }}
        dispatch={() => {}}
        linodes={linodes}
      />
    );

    expect(panel.find('tr').at(1).find('td')
      .at(0)
      .find('Link').length)
      .to.equal(1);
    expect(panel.find('tr').at(1).find('td')
      .at(0)
      .find('Link')
      .props())
      .to.have.property('to')
      .which.equals(path);
  });

  it('renders config label text', () => {
    const panel = mount(
      <ConfigPanel
        params={{ linodeId: '1234' }}
        dispatch={() => {}}
        linodes={linodes}
      />
    );

    expect(panel.find('tr').at(1).find('td')
      .at(0)
      .text())
      .to.equal('Test config');
  });

  it('renders delete button when multiple configs are present', () => {
    const panel = mount(
      <ConfigPanel
        params={{ linodeId: '1238' }}
        dispatch={() => {}}
        linodes={linodes}
      />
    );

    expect(panel.find('tr').at(1).find('td')
      .at(1)
      .text())
      .to.equal('Delete');
  });

  it('does not render delete button for one config', () => {
    const panel = mount(
      <ConfigPanel
        params={{ linodeId: '1234' }}
        dispatch={() => {}}
        linodes={linodes}
      />
    );

    expect(panel.find('.delete-button').length).to.equal(0);
  });

  it('attempts to delete config', async () => {
    const panel = shallow(
      <ConfigPanel
        params={{ linodeId: '1238' }}
        dispatch={dispatch}
        linodes={linodes}
      />
    );

    const actionBtn = panel.find('.action-link').at(0);
    actionBtn.simulate('click', { preventDefault: () => {} });
    expect(dispatch.calledOnce).to.equal(true);
    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/linode/instances/1238/configs/12345',
      d => expect(d.args[0]).to.deep.equal(actions.configs.delete(1238, 12345)),
      null, { method: 'DELETE' });
  });
});
