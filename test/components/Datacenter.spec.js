import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';

import Region from '~/components/Region';
import { flags } from '~/assets';
import { regions } from '@/data/regions';

describe('components/Region', () => {
  it('renders the regions', () => {
    const c = mount(
      <Region
        regions={regions}
        onRegionSelected={() => {}}
      />
    );

    expect(c.find('h2').text()).to.equal('Region');
    expect(c.find('h3').text()).to.equal('North America');
    expect(c.find('.region').length).to.equal(1);
    expect(c.find('.region header .title').text()).to.equal('Newark, NJ');
    const img = c.find('img').props();
    expect(img.src).to.equal(flags[regions['us-east-1a'].country]);
    expect(img.width).to.equal(64);
    expect(img.height).to.equal(64);
    expect(img.alt).to.equal('Newark, NJ');
  });

  it('renders disabled', () => {
    const c = shallow(
      <Region
        regions={regions}
        selected="us-east-1a"
        onRegionSelected={() => {}}
        disabled
      />
    );

    expect(c.contains(
      <p>
        The source you selected limits the regions you may deploy
        your new Linode to.
      </p>)).to.equal(true);
  });

  it('dispatches the appropriate event on select', () => {
    const env = { onSelect: () => {} };
    const onSelect = sinon.stub(env, 'onSelect');
    const c = mount(
      <Region
        regions={regions}
        onRegionSelected={onSelect}
      />
    );

    c.find('.region').simulate('click');
    expect(onSelect.callCount).to.equal(1);
    expect(onSelect.firstCall.args[0]).to.equal(regions['us-east-1a'].id);
  });
});
