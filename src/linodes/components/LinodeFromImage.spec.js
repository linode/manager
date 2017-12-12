import { mount } from 'enzyme';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import { REGION_MAP } from '~/constants';
import { LinodeFromImage } from '~/linodes/components';

import {
  changeInput,
  expectDispatchOrStoreErrors,
  expectRequest,
} from '~/test.helpers';
import { api } from '~/data';
import { testType } from '~/data/types';
import { testImage } from '~/data/images';


const { types: { types } } = api;
const { images } = api;

describe('linodes/components/LinodeFromImage', function () {
  const sandbox = sinon.sandbox.create();
  let dispatch = sandbox.spy();

  afterEach(() => {
    sandbox.restore();
    dispatch = sandbox.spy();
  });

  it.skip('creates a linode from an image with backups', async function () {
    LinodeFromImage.trigger(dispatch, types, images);
    const modal = mount(dispatch.firstCall.args[0].body);

    changeInput(modal, 'label', 'Ubuntu Linode');
    changeInput(modal, 'region', REGION_MAP.Asia[1]);
    changeInput(modal, 'plan', testType.id);
    changeInput(modal, 'image', testImage.id);
    changeInput(modal, 'backups', true);

    dispatch.reset();

    modal.find('Form').props().onSubmit();

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/', {
        method: 'POST',
        body: {
          label: 'Ubuntu Linode',
          region: REGION_MAP.Asia[1],
          type: testType.id,
          image: testImage.id,
          backups_enabled: true,
        },
      }),
      ([pushResult]) => expect(pushResult).toEqual(push('/linodes/my-linode')),
    ], 2, [{ label: 'my-linode' }]);
  });
});
