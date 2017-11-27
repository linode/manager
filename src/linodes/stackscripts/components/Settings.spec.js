import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import Settings from '~/linodes/stackscripts/components/Settings';

import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers.js';
import { testStackScript } from '~/data/stackscripts';

describe('linodes/stackscripts/components/Settings', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('saves stackscript settings', async () => {
    const component = mount(
      <Settings
        dispatch={dispatch}
        stackscript={testStackScript}
        distributions={{}}
      />
    );

    changeInput(component, 'label', 'WordPress');
    changeInput(component, 'description', 'My stackscript');
    changeInput(component, 'distributions', ['linode/debian6']);
    changeInput(component, 'isPublic', true);

    component.find('Form').props().onSubmit();

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/linode/stackscripts/${testStackScript.id}`, {
        method: 'PUT',
        body: {
          label: 'WordPress',
          description: 'My stackscript',
          distributions: ['linode/debian6'],
          is_public: true,
        },
      }),
    ], 1);
  });
});
