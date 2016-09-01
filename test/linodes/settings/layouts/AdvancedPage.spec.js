import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { api } from '@/data';
import { AdvancedPage } from '~/linodes/settings/layouts/AdvancedPage';
const { linodes } = api;

describe('linodes/settings/layouts/AdvancedPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('renders config panel component', () => {
    const page = mount(
      <AdvancedPage
        linodes={linodes}
        params={{ linodeId: '1235' }}
        dispatch={() => {}}
      />
    );

    expect(page.find('ConfigPanel').length).to.equal(1);
  });

  it('renders disk panel component', () => {
    const page = mount(
      <AdvancedPage
        linodes={linodes}
        params={{ linodeId: '1235' }}
        dispatch={() => {}}
      />
    );

    expect(page.find('DiskPanel').length).to.equal(1);
  });
});
