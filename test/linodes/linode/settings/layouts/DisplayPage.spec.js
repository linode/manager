import React from 'react';
import sinon from 'sinon';
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';

import { expectRequest } from '@/common';
import { api } from '@/data';
import { DisplayPage } from '~/linodes/linode/settings/layouts/DisplayPage';

const { linodes } = api;

describe('linodes/linode/settings/layouts/DisplayPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  const props = {
    dispatch,
    linodes,
    params: { linodeId: '1234' },
  };

  it('renders display page', async () => {
    const page = shallow(
      <DisplayPage {...props} />
    );

    expect(page.find('header h2').text()).to.equal('Display');
    expect(page.find('[name="group"]').props().value).to.equal('Test Group');
    expect(page.find('[name="label"]').props().value).to.equal('Test Linode');
    expect(page.find('button.btn').at(0).text()).to.equal('Save');
  });

  it('changes group and label values onChange', async () => {
    const page = await mount(<DisplayPage {...props} />);

    page.find('input').map((element) => {
      const { value, name, onChange } = element.props();
      const newValue = `${value} Changed`;
      onChange({ target: { value: newValue } });
      expect(page.state(name)).to.equal(newValue);
      expect(element.props().value).to.equal(newValue);
    });
  });

  it('makes request to save changes', async () => {
    const page = shallow(<DisplayPage {...props} />);

    const linode = linodes.linodes[props.params.linodeId];
    page.find('button').simulate('click', { preventDefault() {} });
    expect(dispatch.calledOnce).to.equal(true);
    const fn = dispatch.firstCall.args[0];
    const dispatched = () => ({ authentication: { token: 'hi' } });
    await expectRequest(fn, `/linode/instances/${linode.id}`, dispatched,
                        { group: linode.group, label: linode.label }, { method: 'PUT' });
  });

  it('shows error if label is invalid', async () => {
    const env = { dispatch() {} };
    const error = 'this is my error string';
    const dispatchStub = sandbox.stub(env, 'dispatch');
    dispatchStub.throws({
      json: () => ({
        errors: [{ field: 'label', reason: error }],
      }),
    });

    const page = await mount(
      <DisplayPage
        dispatch={dispatchStub}
        linodes={props.linodes}
        params={props.params}
      />
    );

    expect(dispatchStub.callCount).to.equal(1);
    await page.instance().onSubmit({ preventDefault() {} });
    expect(dispatchStub.calledTwice).to.equal(true);

    const label = page.find('FormGroup').at(1);
    expect(label.find('.form-control-feedback > div').text()).to.equal(error);
  });
});
