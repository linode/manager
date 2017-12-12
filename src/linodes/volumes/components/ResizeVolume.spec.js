import { mount } from 'enzyme';
import sinon from 'sinon';

import { ResizeVolume } from '~/linodes/volumes/components';

import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers';
import { testVolume } from '~/data/volumes';


describe('linodes/volumes/components/ResizeVolume', function () {
  const sandbox = sinon.sandbox.create();
  let dispatch = sandbox.spy();

  afterEach(() => {
    sandbox.restore();
    dispatch = sandbox.spy();
  });

  it.skip('resizes a volume', async function () {
    ResizeVolume.trigger(dispatch, testVolume);
    const modal = mount(dispatch.firstCall.args[0].body);

    changeInput(modal, 'size', 20);

    dispatch.reset();
    await modal.find('Form').props().onSubmit();

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/volumes/${testVolume.id}/resize`, {
        method: 'POST',
        body: { size: 20 },
      }),
    ], 1);
  });
});
