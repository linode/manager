import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { Disks } from '~/linodes/linode/settings/advanced/components';

import { testLinode, testLinode1236, testLinodeWithUnallocatedSpace } from '@/data/linodes';
import { SHOW_MODAL } from '~/actions/modal';


describe('linodes/linode/settings/components/Disks', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });
});
