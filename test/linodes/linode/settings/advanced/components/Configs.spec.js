import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { Configs } from '~/linodes/linode/settings/advanced/components';

import { expectRequest } from '@/common';
import { testLinode, testLinode1238, testLinode1239 } from '@/data/linodes';


describe('linodes/linode/settings/advanced/components/Configs', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });
});
