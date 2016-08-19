import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import { ConfigPanel } from '~/linodes/settings/components/ConfigPanel';
import { linodes } from '~/../test/data';

describe('linodes/settings/components/ConfigPanel', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
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
});
