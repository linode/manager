import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import { state } from '@/data';
import { testLinode, testLinode1235, testLinode1237 } from '@/data/linodes';
import { expectRequest } from '@/common';
import { Dropdown } from 'linode-components/dropdowns';
import { IndexPage } from '~/linodes/linode/layouts/IndexPage';

describe('linodes/linode/layouts/IndexPage', () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.spy();

  const router = { setRouteLeaveHook: sandbox.spy() };

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('preloads type and configs', async () => {
    const _dispatch = sandbox.stub();
    _dispatch.returns({ id: 1241, type: 'g5-standard-1' });
    await IndexPage.preload({ dispatch: _dispatch, getState: () => state },
                            { linodeLabel: 'test-linode-7' });

    expect(_dispatch.callCount).to.equal(3);

    const fn1 = _dispatch.secondCall.args[0];
    let fn2 = _dispatch.thirdCall.args[0];
    _dispatch.reset();
    await expectRequest(fn1, '/linode/types/g5-standard-1', { method: 'GET' });

    _dispatch.reset();
    _dispatch.returns({ pages: 1, configs: [], results: 0 });
    await fn2(_dispatch, () => state);

    fn2 = _dispatch.firstCall.args[0];
    await expectRequest(fn2, '/linode/instances/1241/configs/?page=1', { method: 'GET' }, {
      configs: [],
    });
  });

  it('renders the linode label and group', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        linode={testLinode}
        router={router}
      />);

    const h1Link = page.find('h1 Link');
    expect(h1Link.props().to).to.equal(`/linodes/${testLinode.label}`);
    const displayGroupProps = h1Link.find('GroupLabel').props();
    expect(displayGroupProps.object.group).to.equal(testLinode.group);
    expect(displayGroupProps.object.label).to.equal(testLinode.label);
  });

  it('renders the linode label alone when ungrouped', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        linode={testLinode1235}
        router={router}
      />);

    const h1Link = page.find('h1 Link');
    expect(h1Link.props().to).to.equal('/linodes/test-linode-1');
    expect(h1Link.text()).to.equal('test-linode-1');
  });

  it('renders a power management dropdown', () => {
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        linode={testLinode}
      />);
    const dropdown = page.find('StatusDropdown');
    expect(dropdown.length).to.equal(1);
  });

  it('does not render power management dropdown when linode is transitioning', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        linode={testLinode1237}
        router={router}
      />);
    expect(page.contains(Dropdown)).to.equal(false);
  });
});
