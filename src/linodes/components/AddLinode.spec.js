import React from 'react';
import { mount } from 'enzyme';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import { REGION_MAP } from '~/constants';
import { AddLinode } from '~/linodes/components';

import {
  changeInput,
  expectDispatchOrStoreErrors,
  expectRequest,
} from '~/test.helpers';
import { api } from '~/data';
import { testType } from '~/data/types';
import { testLinodeImage } from '~/data/images';


const { images: { images }, types: { types } } = api;

describe.skip('linodes/components/AddLinode', function () {
  const sandbox = sinon.sandbox.create();
  let dispatch = sandbox.spy();

  afterEach(() => {
    sandbox.restore();
    dispatch = sandbox.spy();
  });

  it('creates a linode with no distribution', async function () {
    const modal = mount(
      <AddLinode
        dispatch={dispatch}
        close={() => null}
        images={images}
        plans={types}
      />
    );

    changeInput(modal, 'label', 'No distro linode');
    changeInput(modal, 'region', REGION_MAP.Asia[0]);
    changeInput(modal, 'image', 'none');
    changeInput(modal, 'plan', testType.id);

    dispatch.reset();

    modal.find('Form').props().onSubmit();

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/', {
        method: 'POST',
        body: {
          label: 'No distro linode',
          region: REGION_MAP.Asia[0],
          type: testType.id,
        },
      }),
      ([pushResult]) => expect(pushResult).toEqaule(push('/linodes/my-linode')),
    ], 2, [{ label: 'my-linode' }]);
  });

  it.skip('creates a linode with a distribution and backups', async function () {
    AddLinode.trigger(dispatch, images, types);
    const modal = mount(dispatch.firstCall.args[0].body);

    changeInput(modal, 'label', 'Ubuntu Linode');
    changeInput(modal, 'region', REGION_MAP.Asia[1]);
    changeInput(modal, 'plan', testType.id);
    changeInput(modal, 'image', testLinodeImage.id);
    changeInput(modal, 'password', 'foobar');
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
          image: testLinodeImage.id,
          root_pass: 'foobar',
          backups_enabled: true,
        },
      }),
      ([pushResult]) => expect(pushResult).toEqual(push('/linodes/my-linode')),
    ], 2, [{ label: 'my-linode' }]);
  });
});
