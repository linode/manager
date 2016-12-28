import React from 'react';
import { push } from 'react-router-redux';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { RebuildPage } from '~/linodes/linode/layouts/RebuildPage';
import { expectRequest, expectObjectDeepEquals } from '@/common';
import { api } from '@/data';

describe('linodes/linode/layouts/RebuildPage', () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('rebuilds the linode', async () => {
    const page = mount(
      <RebuildPage
        dispatch={dispatch}
        distributions={api.distributions}
        linodes={api.linodes}
        params={{ linodeLabel: 'test-linode' }}
      />
    );

    dispatch.reset();

    page.find('.LinodesDistribution').first().simulate('click');
    page.find('.LinodesLinodeRebuildPage-password input').simulate('change',
      { target: { value: 'new password' } });

    await page.instance().onSubmit();

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/linode/instances/1234/rebuild', () => {}, null,
      d => {
        expect(d.method).to.equal('POST');
        expectObjectDeepEquals(JSON.parse(d.body), {
          distribution: 'linode/debian7',
          root_pass: 'new password',
        });
      }
    );

    const fn2 = dispatch.secondCall.args[0];
    expectObjectDeepEquals(fn2, push('/linodes/test-linode'));
  });
});
