import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { SummaryPage } from '~/linodes/linode/backups/layouts/SummaryPage';

describe('linodes/linode/backups/layouts/SummaryPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('renders snapshot panel component', () => {
    const page = mount(
      <SummaryPage />
    );

    expect(page.find('.card').at(0).text()).to.contain('Snapshot');
  });

  it('renders restore panel component', () => {
    const page = mount(
      <SummaryPage />
    );

    expect(page.find('.card').at(1).text()).to.contain('Restore');
  });
});
