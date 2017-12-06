import { mount } from 'enzyme';
import sinon from 'sinon';

import { AVAILABLE_VOLUME_REGIONS } from '~/constants';
import { AddEditVolume } from '~/linodes/volumes/components';

import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers';
import { api } from '~/data';
import { testLinode1238 } from '~/data/linodes';
import { testVolume } from '~/data/volumes';

const { linodes: { linodes } } = api;

describe('linodes/volumes/components/AddEditVolume', function () {
  const sandbox = sinon.sandbox.create();
  let dispatch = sandbox.spy();

  afterEach(() => {
    sandbox.restore();
    dispatch = sandbox.spy();
  });

  it.skip('creates a volume', async function () {
    AddEditVolume.trigger(dispatch, linodes);
    const modal = mount(dispatch.firstCall.args[0].body);

    expect(modal.find('config').length).toBe(0);

    changeInput(modal, 'label', 'my-volume');
    changeInput(modal, 'region', AVAILABLE_VOLUME_REGIONS[0]);
    changeInput(modal, 'size', 20);

    dispatch.reset();
    await modal.find('Form').props().onSubmit();

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/volumes/', {
        method: 'POST',
        body: {
          label: 'my-volume',
          region: AVAILABLE_VOLUME_REGIONS[0],
          size: 20,
        },
      }),
    ], 1);
  });

  it.skip('creates a volume and attaches it', async function () {
    AddEditVolume.trigger(dispatch, linodes);
    const modal = mount(dispatch.firstCall.args[0].body);

    expect(modal.find('config').length).toBe(0);

    changeInput(modal, 'label', 'my-volume');
    changeInput(modal, 'region', AVAILABLE_VOLUME_REGIONS[0]);
    changeInput(modal, 'size', 20);
    changeInput(modal, 'linode', 12345);

    dispatch.reset();
    await modal.find('Form').props().onSubmit();

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/volumes/', {
        method: 'POST',
        body: {
          label: 'my-volume',
          region: AVAILABLE_VOLUME_REGIONS[0],
          size: 20,
          linode_id: 12345,
        },
      }),
    ], 2, [{ id: '12345' }]);
  });

  it.skip('creates a volume and attaches it to selected config', async function () {
    AddEditVolume.trigger(dispatch, linodes);
    const modal = mount(dispatch.firstCall.args[0].body);
    const configId = Object.keys(testLinode1238._configs.configs)[0];

    changeInput(modal, 'label', 'my-volume');
    changeInput(modal, 'region', AVAILABLE_VOLUME_REGIONS[0]);
    changeInput(modal, 'size', 20);
    changeInput(modal, 'linode', testLinode1238.id);
    modal.instance().setState({
      allConfigs: { [testLinode1238.id]: Object.values(testLinode1238._configs.configs).map(
        c => ({ value: c.id, label: c.label })) },
    });
    changeInput(modal, 'config', configId);

    dispatch.reset();
    await modal.find('Form').props().onSubmit();

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/volumes/', {
        method: 'POST',
        body: {
          label: 'my-volume',
          region: AVAILABLE_VOLUME_REGIONS[0],
          size: 20,
          linode_id: testLinode1238.id,
          config_id: configId,
        },
      }),
    ], 2, [{ id: '12345' }]);
  });

  it.skip('updates an existing volume', async function () {
    AddEditVolume.trigger(dispatch, linodes, testVolume);
    const modal = mount(dispatch.firstCall.args[0].body);

    expect(modal.find('config').length).toBe(0);

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
