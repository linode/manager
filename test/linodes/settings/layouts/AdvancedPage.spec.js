import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import { linodes } from '~/../test/data';
import { AdvancedPage } from '~/linodes/settings/layouts/AdvancedPage';

describe('linodes/settings/layouts/AdvancedPage', async () => {
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
        params={{ linodeId: 'linode_1235' }}
        dispatch={() => {}}
      />
    );

    expect(page.find('ConfigPanel')).to.exist;
  });
});
