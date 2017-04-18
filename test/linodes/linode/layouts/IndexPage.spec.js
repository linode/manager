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

  it('preloads the configs', async () => {
    const _dispatch = sinon.stub();
    _dispatch.returns({ id: 1241 });
    await IndexPage.preload({ dispatch: _dispatch, getState: () => state },
                            { linodeLabel: 'test-linode-7' });

    let fn = _dispatch.secondCall.args[0];
    _dispatch.reset();
    _dispatch.returns({ total_pages: 1, configs: [], total_results: 0 });
    await fn(_dispatch, () => state);
    fn = _dispatch.firstCall.args[0];
    await expectRequest(fn, '/linode/instances/1241/configs/?page=1', undefined, {
      configs: [],
    });
  });

  it('renders the linode label and group', () => {
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        linode={testLinode}
        router={router}
      />);

    const h1Link = page.find('h1 Link');
    expect(h1Link.props().to).to.equal(`/linodes/${testLinode.label}`);
    expect(h1Link.props().children).to.equal(`${testLinode.group} / ${testLinode.label}`);
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
