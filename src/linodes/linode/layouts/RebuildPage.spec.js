import { mount, shallow } from 'enzyme';
import React from 'react';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import { RebuildPage } from '~/linodes/linode/layouts/RebuildPage';

import {
  changeInput, expectDispatchOrStoreErrors, expectRequest,
} from '~/test.helpers';
import { api } from '~/data';
import { testLinode } from '~/data/linodes';


describe('linodes/linode/layouts/RebuildPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should render without error', () => {
    const dispatch = jest.fn();
    const wrapper = shallow(
      <RebuildPage
        dispatch={dispatch}
        distributions={api.distributions.distributions}
        linode={testLinode}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it.skip('rebuilds the linode', async () => {
    const dispatch = sandbox.spy();
    const page = mount(
      <RebuildPage
        dispatch={dispatch}
        distributions={api.distributions.distributions}
        linode={testLinode}
      />
    );

    changeInput(page, 'distribution', 'linode/debian7');
    changeInput(page, 'password', 'new password');

    dispatch.reset();
    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    const modal = mount(dispatch.firstCall.args[0].body);

    dispatch.reset();
    await modal.props().onSubmit();

    expect(dispatch.callCount).toBe(2);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/1234/rebuild', {
        method: 'POST',
        body: {
          distribution: 'linode/debian7',
          root_pass: 'new password',
        },
      }, {
        ...testLinode,
        disks: testLinode._disks,
        configs: testLinode._configs,
      }),
      ([pushResult]) => expect(pushResult).toEqual(push('/linodes/test-linode')),
    ]);
  });
});
