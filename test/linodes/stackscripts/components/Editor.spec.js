import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import Editor from '~/linodes/stackscripts/components/Editor';

import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '@/common.js';
import { testStackScript } from '@/data/stackscripts';


describe('linodes/stackscripts/components/Editor', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('saves stackscript editor', async () => {
    const component = mount(
      <Editor
        dispatch={dispatch}
        stackscript={testStackScript}
      />
    );

    changeInput(component, 'script', 'my script', { nameOnly: true, displayName: 'CodeEditor' });
    changeInput(component, 'revision', 'revision note');

    component.find('Form').props().onSubmit();

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/linode/stackscripts/${testStackScript.id}`, {
        method: 'PUT',
        body: {
          script: 'my script',
          rev_note: 'revision note',
        },
      }),
    ], 1);
  });
});
