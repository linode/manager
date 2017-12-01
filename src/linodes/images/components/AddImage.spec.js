import { mount } from 'enzyme';
import sinon from 'sinon';

import { AddImage } from '~/linodes/images/components';

import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers';
import { api } from '~/data';
import { testLinode1238 } from '~/data/linodes';

const { linodes } = api;

describe('linodes/images/components/AddImage', function () {
  const sandbox = sinon.sandbox.create();
  let dispatch = sandbox.spy();

  afterEach(() => {
    sandbox.restore();
    dispatch = sandbox.spy();
  });

  it.skip('creates an image', async function () {
    AddImage.trigger(dispatch, linodes);
    const modal = await mount(dispatch.firstCall.args[0].body);
    const diskId = Object.keys(testLinode1238._disks.disks)[0].id;

    changeInput(modal, 'label', 'my-image');
    changeInput(modal, 'description', 'image details');
    changeInput(modal, 'linode', testLinode1238.id);
    modal.instance().setState({
      allDisks: { [testLinode1238.id]: Object.values(testLinode1238._disks.disks).map(
        d => ({ value: d.id, label: d.label, size: d.size, filesystem: d.filesystem })) },
      disk: diskId,
    });

    dispatch.reset();
    await modal.find('Form').props().onSubmit();

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/1238/disks/12345/imagize', {
        method: 'POST',
        body: {
          label: 'my-image',
          description: 'image details',
        },
      }),
    ], 2);
  });

  it.skip('creates an image in settings', async function () {
    const disk = Object.keys(testLinode1238._disks.disks)[0];
    AddImage.trigger(dispatch, undefined, 1238, disk);
    const modal = await mount(dispatch.firstCall.args[0].body);

    changeInput(modal, 'label', 'my-image');
    changeInput(modal, 'description', 'image details');

    dispatch.reset();
    await modal.find('Form').props().onSubmit();

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/1238/disks/12345/imagize', {
        method: 'POST',
        body: {
          label: 'my-image',
          description: 'image details',
        },
      }),
    ], 2);
  });
});
