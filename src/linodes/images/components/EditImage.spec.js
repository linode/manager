import { mount } from 'enzyme';
import sinon from 'sinon';

import { EditImage } from '~/linodes/images/components';

import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers';
import { testPrivateImage } from '~/data/images';

describe('linodes/images/components/EditImage', function () {
  const sandbox = sinon.sandbox.create();
  let dispatch = sandbox.spy();

  afterEach(() => {
    sandbox.restore();
    dispatch = sandbox.spy();
  });

  it.skip('update an image', async function () {
    EditImage.trigger(dispatch, testPrivateImage);
    const modal = await mount(dispatch.firstCall.args[0].body);

    changeInput(modal, 'label', 'my-image');
    changeInput(modal, 'description', 'image details');

    dispatch.reset();
    await modal.find('Form').props().onSubmit();

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/images/private/38', {
        method: 'PUT',
        body: {
          label: 'my-image',
          description: 'image details',
        },
      }),
    ], 2);
  });
});
