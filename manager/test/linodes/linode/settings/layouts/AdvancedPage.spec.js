import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import { api } from '@/data';
import { AdvancedPage } from '~/linodes/linode/settings/layouts/AdvancedPage';
const { linodes } = api;

describe('linodes/linode/settings/layouts/AdvancedPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('renders config panel component', () => {
    const page = shallow(
      <AdvancedPage
        linodes={linodes}
        params={{ linodeLabel: 'test-linode-1' }}
        dispatch={() => {}}
      />
    );

    expect(page.find('ConfigPanel').length).to.equal(1);
  });

  it('renders disk panel component', () => {
    const page = shallow(
      <AdvancedPage
        linodes={linodes}
        params={{ linodeLabel: 'test-linode-1' }}
        dispatch={() => {}}
      />
    );

    expect(page.find('DiskPanel').length).to.equal(1);
  });
});
