import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import * as fetch from '~/fetch';
import { ConfigPanel } from '~/linodes/settings/components/ConfigPanel';
import { DELETE_LINODE_CONFIG } from '~/actions/api/linodes';
import { linodes } from '~/../test/data';

describe('linodes/settings/components/ConfigPanel', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('renders config help button', () => {
    const panel = mount(
      <ConfigPanel
        params={{ linodeId: 'linode_1239' }}
        dispatch={() => {}}
        linodes={linodes}
      />
    );

    expect(panel.find('HelpButton')).to.exist;
  });

  it('renders add a config button', () => {
    const panel = shallow(
      <ConfigPanel
        params={{ linodeId: 'linode_1239' }}
        dispatch={() => {}}
        linodes={linodes}
      />
    );

    expect(panel.find('.input-group').find('a')).to.exist;
    expect(panel.find('.input-group').find('a').text()).to.equal('Add a config');
    expect(panel.find('.input-group').find('a').props())
      .to.have.property('href')
      .to.equal('/linodes/linode_1239/configs/create');
  });

  it('renders with no config', () => {
    const panel = shallow(
      <ConfigPanel
        params={{ linodeId: 'linode_1239' }}
        dispatch={() => {}}
        linodes={linodes}
      />
    );

    expect(panel.find('p').text()).to.equal('No configs yet. Add a config.');
  });

  it('renders multiple configs', () => {
    const panel = shallow(
      <ConfigPanel
        params={{ linodeId: 'linode_1238' }}
        dispatch={() => {}}
        linodes={linodes}
      />
    );

    expect(panel.find('tr').length).to.equal(3);
  });

  it('renders config label link', () => {
    const path = '/linodes/linode_1234/configs/config_12345';
    const panel = shallow(
      <ConfigPanel
        params={{ linodeId: 'linode_1234' }}
        dispatch={() => {}}
        linodes={linodes}
      />
    );

    expect(panel.find('tr').at(1).find('td')
      .at(0)
      .find('Link'))
      .to.exist;
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
        params={{ linodeId: 'linode_1234' }}
        dispatch={() => {}}
        linodes={linodes}
      />
    );

    expect(panel.find('tr').at(1).find('td')
      .at(0)
      .text())
      .to.equal('Test config');
  });

  it('renders delete button', () => {
    const panel = mount(
      <ConfigPanel
        params={{ linodeId: 'linode_1234' }}
        dispatch={() => {}}
        linodes={linodes}
      />
    );

    expect(panel.find('tr').at(1).find('td')
      .at(1)
      .text())
      .to.equal('Delete');
  });

  it('attempts to delete config', async () => {
    const panel = mount(
      <ConfigPanel
        params={{ linodeId: 'linode_1234' }}
        dispatch={dispatch}
        linodes={linodes}
      />
    );

    const actionBtn = panel.find('.action-link');
    actionBtn.simulate('click');
    expect(dispatch.calledOnce).to.equal(true);
    const fn = dispatch.firstCall.args[0];
    // Assert that fn is a function that invokes DELETE /linodes/linode_1234/configs/config_12345
    const fetchStub = sandbox.stub(fetch, 'fetch').returns({
      json: () => {},
    });
    dispatch.reset();
    await fn(dispatch, () => ({
      authentication: { token: 'token' },
      api: {
        linodes: {
          linodes: {
            linode_1234: {
              _configs: {
                configs: {
                  config_12345: { },
                },
                totalPages: -1,
              },
            },
          },
        },
      },
    }));
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[1]).to.equal('/linodes/linode_1234/configs/config_12345');
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0].type).to.equal(DELETE_LINODE_CONFIG);
  });
});
