import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import { testLinode1235 } from '@/data/linodes';
import { ConfigsDisksPage } from '~/linodes/linode/settings/advanced/layouts/ConfigsDisksPage';

describe('linodes/linode/settings/advanced/layouts/ConfigsDisksPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('renders config panel component', () => {
    const page = shallow(
      <ConfigsDisksPage
        linode={testLinode1235}
        dispatch={() => {}}
      />
    );

    expect(page.find('ConfigPanel').length).to.equal(1);
  });

  it('renders disk panel component', () => {
    const page = shallow(
      <ConfigsDisksPage
        linode={testLinode1235}
        dispatch={() => {}}
      />
    );

    expect(page.find('DiskPanel').length).to.equal(1);
  });
});
