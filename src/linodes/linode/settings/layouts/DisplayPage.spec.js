import { mount, shallow } from 'enzyme';
import React from 'react';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import { DisplayPage } from '~/linodes/linode/settings/layouts/DisplayPage';

import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers';
import { testLinode } from '~/data/linodes';


describe('linodes/linode/settings/layouts/DisplayPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should render without error', () => {
    const dispatch = jest.fn();
    const wrapper = shallow(
      <DisplayPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it.skip('makes request to save changes', async () => {
    const dispatch = sandbox.spy();
    const page = mount(
      <DisplayPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );

    changeInput(page, 'group', 'foobar');

    dispatch.reset();
    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/1234', {
        method: 'PUT',
        body: { group: 'foobar', label: testLinode.label },
      }),
    ], 1);
  });

  it.skip('redirects if the label changed', async () => {
    const dispatch = sandbox.spy();
    const page = mount(
      <DisplayPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );

    changeInput(page, 'group', 'foobar');
    changeInput(page, 'label', 'my-new-label');

    dispatch.reset();
    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/1234', {
        method: 'PUT',
        body: { group: 'foobar', label: 'my-new-label' },
      }),
      () => {},
      ([pushResult]) => expect(pushResult).toEqual(push('/linodes/my-new-label/settings')),
    ], 2);
  });
});
