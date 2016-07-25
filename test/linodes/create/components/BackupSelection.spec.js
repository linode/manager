import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';

import { BackupSelection } from '~/linodes/create/components/BackupSelection';
import { testDistros, linodes } from '~/../test/data';

describe('linodes/create/components/BackupSelection', () => {
  const sandbox = sinon.sandbox.create();
  afterEach(() => {
    sandbox.restore();
  });

  const state = {
    linodes,
    create: {
      source: {
        source: null,
        sourceTab: 0,
      },
    },
    distros: { distributions: { ...testDistros } },
  };

  it('renders the Backups', () => {
    const c = shallow(
      <BackupSelection
        onSourceSelected={() => {}}
        linodes={state.linodes}
        goBack={() => {}}
        selectedLinode="linode_1234"
        dispatch={() => {}}
      />
    );

    expect(c.find('Backup').length).to.equal(2);
  });

  it('invokes the onSourceSelected function as necessary for Backups', () => {
    const onSourceSelected = sandbox.spy();
    const c = mount(
      <BackupSelection
        onSourceSelected={onSourceSelected}
        linodes={state.linodes}
        goBack={() => {}}
        selectedLinode="linode_1234"
        dispatch={() => {}}
      />
    );

    c.find('Backup').first().simulate('click');
    expect(onSourceSelected.calledOnce).to.equal(true);
    expect(onSourceSelected.calledWith('backup_54778593')).to.equal(true);
  });

  it('calls the goBack function when the back button is pressed', () => {
    const goBack = sandbox.spy();
    const c = shallow(
      <BackupSelection
        onSourceSelected={() => {}}
        linodes={state.linodes}
        goBack={goBack}
        selectedLinode="linode_1234"
        dispatch={() => {}}
      />
    );

    c.find('.back').simulate('click', { preventDefault() {} });
    expect(goBack.calledOnce).to.equal(true);
  });
});
