import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { CreateLinodePage } from '~/linodes/layouts/CreateLinodePage';

describe('linodes/layout/CreateLinodePage', () => {
  function assertContains(thing) {
    return () => {
      const page = shallow(
        <CreateLinodePage
          dispatch={() => {}}
        />);
      expect(page.find(thing).length).to.equal(1);
    };
  }

  [
    'SourceSelection',
    'DatacenterSelection',
    'ServiceSelection',
    'OrderSummary',
  ].map(t => it(`renders a ${t}`, assertContains(t)));
});
