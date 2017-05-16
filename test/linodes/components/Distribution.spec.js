import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { mount } from 'enzyme';

import { distributions as testDistros } from '@/data/distributions';
import Distribution from '~/linodes/components/Distribution';

describe('linodes/components/Distribution', () => {
  const sandbox = sinon.sandbox.create();
  afterEach(() => {
    sandbox.restore();
  });

  const vendor = {
    name: 'Debian',
    versions: [
      testDistros['linode/debian6'],
      testDistros['linode/debian7'],
      testDistros['linode/debian8.1'],
    ],
  };

  it('renders a dropdown with all of the versions', () => {
    const dv = mount(
      <Distribution
        vendor={vendor}
      />
    );

    const versions = dv.find('.Dropdown-item');

    expect(versions.length).to.equal(3);
  });

  it('invokes the selectedVersion function with the correct version', () => {
    const onClick = sandbox.spy();
    const dv = mount(
      <Distribution
        vendor={vendor}
        onClick={onClick}
      />
    );
    dv.find('.Dropdown-menu').at(0).simulate('mousedown', {
      preventDefault: () => {},
      stopPropagation: () => {},
    });
    onClick.reset();
    dv.find('.Dropdown-item').at(1).simulate('mousedown');
    expect(onClick.callCount).to.equal(1);
    expect(onClick.calledWith(vendor.versions[1].id)).to.equal(true);
  });
});
