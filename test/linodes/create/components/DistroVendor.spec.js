import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { distros } from '~/assets';
import { testDistros } from '~/../test/data';
import DistroVendor from '~/linodes/create/components/DistroVendor';

describe('linodes/create/components/DistroVendor', () => {
  const sandbox = sinon.sandbox.create();
  afterEach(() => {
    sandbox.restore();
  });

  const vendor = {
    name: 'Debian',
    versions: [
      testDistros.distro_1237,
      testDistros.distro_1236,
      testDistros.distro_1238,
    ],
  };

  it('renders the selected distro name', () => {
    const dv = shallow(<DistroVendor vendor={vendor} />);
    expect(dv.find(<div>Debian 8.1</div>)).to.exist;
  });

  it('renders the vendor logo', () => {
    const dv = shallow(<DistroVendor vendor={vendor} />);
    expect(dv.find('img').props())
      .to.have.property('src')
      .that.equals(distros.Debian);
  });

  it('renders a dropdown with all of the versions', () => {
    const dv = shallow(<DistroVendor vendor={vendor} />);
    expect(dv.find('.dropdown-item').length).to.equal(3);
    expect(dv.find('.dropdown-item').at(0).text())
      .to.equal(vendor.versions[0].label);
    expect(dv.find('.dropdown-item').at(1).text())
      .to.equal(vendor.versions[1].label);
    expect(dv.find('.dropdown-item').at(2).text())
      .to.equal(vendor.versions[2].label);
  });

  it('invokes the selectedVersion function when clicked', () => {
    const onClick = sandbox.spy();
    const dv = shallow(
      <DistroVendor
        vendor={vendor}
        onClick={onClick}
      />
    );
    dv.find('div').first().simulate('click');
    expect(onClick.calledOnce).to.equal(true);
    expect(onClick.calledWith(vendor.versions[0].id)).to.equal(true);
  });

  it('invokes the selectedVersion function with the correct version', () => {
    const onClick = sandbox.spy();
    const dv = shallow(
      <DistroVendor
        vendor={vendor}
        onClick={onClick}
      />
    );
    dv.find('.dropdown-item').at(2).simulate('mousedown', {
      preventDefault: () => {},
      stopPropagation: () => {},
    });
    onClick.reset();
    dv.find('div').first().simulate('click');
    expect(onClick.calledOnce).to.equal(true);
    expect(onClick.calledWith(vendor.versions[2].id)).to.equal(true);
  });

  it('hides the dropdown on blur', () => {
    const dv = shallow(
      <DistroVendor
        vendor={vendor}
        onClick={() => {}}
      />
    );
    dv.find('.dropdown-toggle').simulate('click', {
      preventDefault() {},
      stopPropagation() {},
    });
    expect(dv.find('.dropdown.open')).to.exist;

    dv.simulate('blur');
    expect(dv.find('.dropdown.open').length).to.equal(0);
  });
});
