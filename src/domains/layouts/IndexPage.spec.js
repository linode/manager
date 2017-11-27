import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import { SHOW_MODAL } from '~/actions/modal';
import { IndexPage } from '~/domains/layouts/IndexPage';

import { api } from '~/data';
import { expectRequest } from '~/test.helpers';


const { domains } = api;

describe('domains/layouts/IndexPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it.only('renders with minimum required props', () => {
    const wrapper = shallow(
      <IndexPage
        dispatch={dispatch}
        selectedMap={{}}
        domains={domains}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });

  /**
   * @todo skipped.
   */
  it.skip('shows the delete modal when delete is pressed', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        selectedMap={{}}
        domains={domains}
      />
    );

    const zoneDelete = page.find('.TableRow Button').at(0);
    dispatch.reset();
    zoneDelete.simulate('click');
    expect(dispatch.callCount).toBe(1);
    expect(dispatch.firstCall.args[0])
      .to.have.property('type').which.equals(SHOW_MODAL);
  });

  /**
   * @todo skipped
   */
  it.skip('deletes selected domains when delete is pressed', async () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        selectedMap={{ 1: true }}
        domains={domains}
      />
    );

    dispatch.reset();

    const actions = page.find('MassEditControl').find('Dropdown').props().groups[0].elements;
    actions.find(a => a && a.name === 'Delete').action();

    const modal = mount(dispatch.firstCall.args[0].body);

    dispatch.reset();
    modal.find('Form').props().onSubmit({ preventDefault() { } });
    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/domains/1', { method: 'DELETE' });
  });
});
