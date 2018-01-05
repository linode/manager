import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';

import { state } from '~/data';
import { testLinode, testLinode1235, testLinode1237 } from '~/data/linodes';
import { expectRequest } from '~/test.helpers';
import { Dropdown } from 'linode-components';
import { IndexPage } from '~/linodes/linode/layouts/IndexPage';

describe('linodes/linode/layouts/IndexPage', () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.spy();

  const router = { setRouteLeaveHook: sandbox.spy() };

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('should render without error', () => {
    const dispatch = jest.fn();
    const wrapper = shallow(
      <IndexPage
        dispatch={dispatch}
        linode={testLinode}
        router={router}
      >
        <div></div>
      </IndexPage>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it.skip('preloads type and configs', async () => {
    const _dispatch = sandbox.stub();
    _dispatch.returns({ id: 1241, type: { id: 'g5-standard-1' } });
    await IndexPage.preload({ dispatch: _dispatch, getState: () => state },
      { linodeLabel: 'test-linode-7' });

    expect(_dispatch.callCount).toBe(3);

    const fn1 = _dispatch.secondCall.args[0];
    let fn2 = _dispatch.thirdCall.args[0];
    _dispatch.reset();
    await expectRequest(fn1, '/linode/types/g5-standard-1');

    _dispatch.reset();
    _dispatch.returns({ pages: 1, configs: [], results: 0 });
    await fn2(_dispatch, () => state);

    fn2 = _dispatch.firstCall.args[0];
    await expectRequest(fn2, '/linode/instances/1241/configs/?page=1', undefined, {
      configs: [],
    });
  });

  it.skip('renders the linode label and group', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        linode={testLinode}
        router={router}
      />
    );

    const h1Link = page.find('h1 Link');
    expect(h1Link.props().to).toBe(`/linodes/${testLinode.label}`);
    const displayGroupProps = h1Link.find('GroupLabel').props();
    expect(displayGroupProps.object.group).toBe(testLinode.group);
    expect(displayGroupProps.object.label).toBe(testLinode.label);
  });

  it.skip('renders the linode label alone when ungrouped', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        linode={testLinode1235}
        router={router}
      />);

    const h1Link = page.find('h1 Link');
    expect(h1Link.props().to).toBe('/linodes/test-linode-1');
    expect(h1Link.text()).toBe('test-linode-1');
  });

  it.skip('renders a power management dropdown', () => {
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        linode={testLinode}
      />);
    const dropdown = page.find('StatusDropdown');
    expect(dropdown.length).toBe(1);
  });

  it.skip('does not render power management dropdown when linode is transitioning', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        linode={testLinode1237}
        router={router}
      />);
    expect(page.contains(Dropdown)).toBe(false);
  });
});
