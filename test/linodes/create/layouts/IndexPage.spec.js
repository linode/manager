import { expect } from 'chai';
import { mount, shallow } from 'enzyme';
import React from 'react';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import { IndexPage } from '~/linodes/create/layouts/IndexPage';

import { expectDispatchOrStoreErrors, expectObjectDeepEquals, expectRequest } from '@/common';
import { api } from '@/data';

describe('linodes/create/layouts/IndexPage', () => {
  const sandbox = sinon.sandbox.create();
  afterEach(() => {
    sandbox.restore();
  });

  it('selects a source when appropriate', () => {
    const page = shallow(
      <IndexPage
        dispatch={() => {}}
        distributions={api.distributions}
        regions={api.regions}
        types={api.types}
        linodes={api.linodes}
      />);
    const ss = page.find('Source');
    ss.props().onDistroSelected('linode/arch2016.05');
    expect(page.instance().state.distribution).to.equal('linode/arch2016.05');
  });

  it('selects a region when appropriate', () => {
    const page = shallow(
      <IndexPage
        dispatch={() => {}}
        distributions={api.distributions}
        regions={api.regions}
        types={api.types}
        linodes={api.linodes}
      />);
    const ds = page.find('Region');
    ds.props().onRegionSelected('us-east-1a');
    expect(page.instance().state.region).to.equal('us-east-1a');
  });

  it('selects a type when appropriate', () => {
    const page = shallow(
      <IndexPage
        dispatch={() => {}}
        distributions={api.distributions}
        regions={api.regions}
        types={api.types}
        linodes={api.linodes}
      />);
    const ss = page.find('Plan');
    ss.props().onServiceSelected('linode1024.5');
    expect(ss.find('.type.selected').find(<div className="title">Linode 1G</div>));
  });

  it('creates a linode when the form is submitted', async () => {
    const dispatch = sandbox.stub();
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        distributions={api.distributions}
        regions={api.regions}
        types={api.types}
        linodes={api.linodes}
      />
    );
    dispatch.reset();

    const changeInput = (id, value) =>
      page.find('Input').find({ id }).simulate('change', { target: { value, name: id } });

    changeInput('label', 'label');
    changeInput('password', 'password');
    page.find('Plan').props().onServiceSelected('the-type');
    page.find('Region').props().onRegionSelected('the-region');
    page.find('Source').props().onDistroSelected('the-distribution');

    dispatch.reset();
    await page.instance().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/', {
        method: 'POST',
        body: {
          root_pass: 'password',
          type: 'the-type',
          distribution: 'the-distribution',
          region: 'the-region',
          label: 'label',
          with_backups: false,
        },
      }),
      ([pushResult]) => expectObjectDeepEquals(pushResult, push('/linodes/label')),
    ], 2, [{ label: 'label' }]);
  });
});
