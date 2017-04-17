import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';

import { distros } from '~/assets';
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

  it('renders the selected distro name', () => {
    const dv = shallow(
      <Distribution
        vendor={vendor}
      />
    );
    expect(dv.contains('Debian 8.1')).to.equal(true);
  });

  it('renders the vendor logo', () => {
    const dv = shallow(
      <Distribution
        vendor={vendor}
      />
    );
    expect(dv.find('img').props())
      .to.have.property('src')
      .that.equals(distros.Debian);
  });

  it('renders a dropdown with all of the versions', () => {
    const dv = shallow(
      <Distribution
        vendor={vendor}
      />
    );

    const versions = dv.find('.LinodesDistribution-version');

    expect(versions.length).to.equal(3);
  });

  it('invokes the selectedVersion function when clicked', () => {
    const onClick = sandbox.spy();
    const dv = shallow(
      <Distribution
        vendor={vendor}
        onClick={onClick}
      />
    );
    dv.find('div').first().simulate('click');
    expect(onClick.callCount).to.equal(1);
    expect(onClick.calledWith(vendor.versions[0].id)).to.equal(true);
  });

  it('invokes the selectedVersion function with the correct version', () => {
    const onClick = sandbox.spy();
    const dv = mount(
      <Distribution
        vendor={vendor}
        onClick={onClick}
      />
    );
    dv.find('.LinodesDistribution-menu').at(0).simulate('mousedown', {
      preventDefault: () => {},
      stopPropagation: () => {},
    });
    onClick.reset();
    dv.find('.LinodesDistribution-version').first().simulate('click');
    expect(onClick.callCount).to.equal(1);
    expect(onClick.calledWith(vendor.versions[0].id)).to.equal(true);
  });

  it('hides the dropdown on blur', () => {
    const dv = shallow(
      <Distribution
        vendor={vendor}
        onClick={() => {}}
      />
    );
    dv.find('.LinodesDistribution-toggleDropdown').simulate('click', {
      preventDefault() {},
      stopPropagation() {},
    });
    expect(dv.find('.LinodesDistribution-dropdown--isOpen').length).to.equal(1);

    dv.simulate('blur');
    expect(dv.find('.LinodesDistribution-dropdown--isOpen').length).to.equal(0);
  });
});
