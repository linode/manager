import { mount } from 'enzyme';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import { REGION_MAP } from '~/constants';
import { AddEditVolume } from '~/linodes/volumes/components';

import {
  changeInput,
  expectDispatchOrStoreErrors,
  expectObjectDeepEquals,
  expectRequest,
} from '@/common';
import { api } from '@/data';
import { testVolume } from '@/data/volumes';


const { linodes: { linodes }, types: { types } } = api;

describe('linodes/volumes/components/AddEditVolume', function () {
  const sandbox = sinon.sandbox.create();
  let dispatch = sandbox.spy();

  afterEach(() => {
    sandbox.restore();
    dispatch = sandbox.spy();
  });

  it('creates a volume', async function () {
    AddEditVolume.trigger(dispatch, linodes, types);
    const modal = mount(dispatch.firstCall.args[0].body);

    changeInput(modal, 'label', 'my-volume');
    changeInput(modal, 'region', REGION_MAP.Asia[0]);
    changeInput(modal, 'size', 20);

    dispatch.reset();

    modal.find('Form').props().onSubmit();

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/volumes/', {
        method: 'POST',
        body: {
          label: 'my-volume',
          region: REGION_MAP.Asia[0],
          size: 20,
        },
      }),
    ], 1);
  });

  it('updates an existing volume', async function () {
    AddEditVolume.trigger(dispatch, linodes, types, testVolume);
    const modal = mount(dispatch.firstCall.args[0].body);

    changeInput(modal, 'label', 'my-new-volume-label');

    dispatch.reset();

    modal.find('Form').props().onSubmit();

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/linode/volumes/${testVolume.id}`, {
        method: 'PUT',
        body: { label: 'my-new-volume-label' },
      }),
    ], 1);
  });
});
