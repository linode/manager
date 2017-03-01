import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { ResizePage } from '~/linodes/linode/layouts/ResizePage';
import { expectRequest, expectObjectDeepEquals } from '@/common';
import { api } from '@/data';

describe('linodes/linode/layouts/ResizePage', () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('resize the linode', async () => {
    const page = mount(
      <ResizePage
        dispatch={dispatch}
        types={api.types}
        linodes={api.linodes}
        params={{ linodeLabel: 'test-linode' }}
      />
    );

    dispatch.reset();

    page.find('.plan').first().simulate('click');
    await page.instance().onSubmit();

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/linode/instances/1234/resize', () => {}, null,
      d => {
        expect(d.method).to.equal('POST');
        expectObjectDeepEquals(JSON.parse(d.body), {
          type: 'linode1024.5',
        });
      }
    );
  });
});
