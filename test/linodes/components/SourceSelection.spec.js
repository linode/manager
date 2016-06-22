import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import SourceSelection from '~/linodes/components/SourceSelection';
import { Tab } from 'react-tabs';

describe('linodes/components/DatacenterSelection', () => {
  it('renders the card header', () => {
    const c = shallow(<SourceSelection />);
    expect(c.contains(<h2>Select a source</h2>)).to.equal(true);
  });

  it('renders the source tabs', () => {
    const c = shallow(<SourceSelection />);
    expect(c.contains(<Tab>Distributions</Tab>)).to.equal(true);
    expect(c.contains(<Tab>StackScripts</Tab>)).to.equal(true);
    expect(c.contains(<Tab>Backups</Tab>)).to.equal(true);
  });
});
