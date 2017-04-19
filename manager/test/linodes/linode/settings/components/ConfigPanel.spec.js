import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import { ConfigPanel } from '~/linodes/linode/settings/components/ConfigPanel';
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

  it('renders with no config', () => {
    const panel = shallow(
      <ConfigPanel
        params={{ linodeLabel: 'test-linode-5' }}
        dispatch={() => {}}
        linodes={linodes}
      />
    );

    expect(panel.find('p').text()).to.equal('No configs yet. Add a config.');
  });

  it('renders multiple configs', () => {
    const panel = mount(
      <ConfigPanel
        params={{ linodeLabel: 'test-linode-4' }}
        dispatch={() => {}}
        linodes={linodes}
      />
    );

    expect(panel.find('tr').length).to.equal(3);
  });

  it('renders config label link', () => {
    const panel = mount(
      <ConfigPanel
        params={{ linodeLabel: `${testLinode.label}` }}
        dispatch={() => {}}
        linodes={linodes}
      />
    );

    expect(panel.find('tr').at(1).find('td')
      .at(0).length)
      .to.equal(1);
  });

  it('renders config label text', () => {
    const panel = mount(
      <ConfigPanel
        params={{ linodeLabel: 'test-linode' }}
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
        params={{ linodeLabel: 'test-linode-4' }}
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
        params={{ linodeLabel: 'test-linode' }}
        dispatch={() => {}}
        linodes={linodes}
      />
    );

    expect(panel.find('.delete-button').length).to.equal(0);
  });

  it('attempts to delete config', async () => {
    const panel = mount(
      <ConfigPanel
        params={{ linodeLabel: 'test-linode-4' }}
        dispatch={dispatch}
        linodes={linodes}
      />
    );
    const actionBtn = panel.
      find('.ConfigPanel-delete').at(0);
    actionBtn.simulate('click', { preventDefault: () => {} });
    expect(dispatch.callCount).to.equal(1);
    await dispatch.args[0][0].body.props.onOk();
    const fn = dispatch.secondCall.args[0];
    dispatch.reset();
    await expectRequest(fn, '/linode/instances/1238/configs/12345', { method: 'DELETE' });
  });
});
