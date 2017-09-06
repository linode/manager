import { mount } from 'enzyme';
import sinon from 'sinon';

import { REGION_MAP } from '~/constants';
import { AttachVolume } from '~/linodes/volumes/components';

import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { api } from '@/data';
import { testVolume } from '@/data/volumes';


const { linodes: { linodes } } = api;

describe('linodes/volumes/components/AttachVolume', function () {
  const sandbox = sinon.sandbox.create();
  let dispatch = sandbox.spy();

  afterEach(() => {
    sandbox.restore();
    dispatch = sandbox.spy();
  });

  it('resizes a volume', async function () {
    AttachVolume.trigger(dispatch, linodes, testVolume);
    const modal = mount(dispatch.firstCall.args[0].body);

    changeInput(modal, 'linode', '1234');

    dispatch.reset();
    await modal.find('Form').props().onSubmit();

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/linode/volumes/${testVolume.id}/attach`, {
        method: 'POST',
        body: {
          linode_id: '1234',
          config_id: null,
        },
      }),
    ], 1);
  });
});
