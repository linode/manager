import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';

import { ListLinodesPage } from './ListLinodes';
import { api } from '~/data';
import { expectRequest } from '~/test.helpers.js';


const { linodes } = api;

describe('linodes/layouts/IndexPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it.skip('renders a list of Linodes', () => {
    const page = mount(
      <ListLinodesPage
        images={{}}
        types={{}}
        dispatch={dispatch}
        selectedMap={{}}
        transfer={{ used: 1, quota: 5 }}
        linodes={linodes.linodes}
      />
    );

    expect(page.find('.TableRow').length).toBe(
      Object.keys(linodes.linodes).length);
  });

  it.skip('deletes selected linodes when delete is pressed', async () => {
    const page = mount(
      <ListLinodesPage
        images={{}}
        types={{}}
        dispatch={dispatch}
        selectedMap={{ 1234: true }}
        transfer={{ used: 1, quota: 5 }}
        linodes={linodes.linodes}
      />);

    dispatch.reset();
    const { groups } = page.find('MassEditControl').find('Dropdown').props();
    groups[2].elements[0].action();
    const modal = mount(dispatch.firstCall.args[0].body);

    dispatch.reset();
    modal.find('Form').props().onSubmit({ preventDefault() { } });

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/linode/instances/1234', { method: 'DELETE' });
  });
});
