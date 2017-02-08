import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow } from 'enzyme';

import { Backups } from '~/linodes/create/components/Backups';
import { api } from '@/data';

describe('linodes/create/components/Backups', () => {
  const sandbox = sinon.sandbox.create();
  afterEach(() => {
    sandbox.restore();
  });

  it('renders the Backups', () => {
    const c = shallow(
      <Backups
        onSourceSelected={() => {}}
        linodes={api.linodes}
        goBack={() => {}}
        selectedLinode={1234}
        dispatch={() => {}}
      />
    );

    expect(c.find('Backup').length).to.equal(2);
  });
