import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import DistributionSelect from '~/linodes/components/DistributionSelect';

import { images } from '~/data/images';


describe('linodes/components/DistributionSelect', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should render a list of image options', () => {
    const wrapper = shallow(
      <DistributionSelect
        name="images"
        onChange={sinon.spy()}
        images={images}
        allowNone
      />
    );
    const select = wrapper.find('Select');
    const groups = select.props().options.map(group => group.label);
    expect(groups).toContain('Arch');
    expect(groups).toContain('Debian');
    expect(groups).toContain('Images');
  });
});
