import { mount } from 'enzyme';
import sinon from 'sinon';

import { REGION_MAP } from '~/constants';
import { AddEditVolume } from '~/linodes/volumes/components';

import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { api } from '@/data';
import { testVolume } from '@/data/volumes';


const { linodes: { linodes } } = api;

describe('linodes/volumes/components/AddEditVolume', function () {
  const sandbox = sinon.sandbox.create();
  let dispatch = sandbox.spy();

  afterEach(() => {
    sandbox.restore();
    dispatch = sandbox.spy();
  });

  it('creates a volume', async function () {
    AddEditVolume.trigger(dispatch, linodes);
    const modal = mount(dispatch.firstCall.args[0].body);

    changeInput(modal, 'label', 'my-volume');
    changeInput(modal, 'region', REGION_MAP.Asia[0]);
    changeInput(modal, 'size', 20);

    dispatch.reset();
    await modal.find('Form').props().onSubmit();

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

  it('creates a volume and attaches it', async function () {
    AddEditVolume.trigger(dispatch, linodes);
    const modal = mount(dispatch.firstCall.args[0].body);

    changeInput(modal, 'label', 'my-volume');
    changeInput(modal, 'region', REGION_MAP.Asia[0]);
    changeInput(modal, 'size', 20);
    changeInput(modal, 'linode', 12345);

    dispatch.reset();
    await modal.find('Form').props().onSubmit();

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/volumes/', {
        method: 'POST',
        body: {
          label: 'my-volume',
          region: REGION_MAP.Asia[0],
          size: 20,
          linode_id: 12345,
        },
      }),
    ], 2, [{ id: '12345' }]);
  });

  it('updates an existing volume', async function () {
    AddEditVolume.trigger(dispatch, linodes, testVolume);
    const modal = mount(dispatch.firstCall.args[0].body);

    changeInput(modal, 'label', 'my-new-volume-label');

    dispatch.reset();

    await modal.find('Form').props().onSubmit();

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/linode/volumes/${testVolume.id}`, {
        method: 'PUT',
        body: { label: 'my-new-volume-label' },
      }),
    ], 1);
  });
});
