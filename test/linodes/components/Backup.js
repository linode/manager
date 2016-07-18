import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import Backup from '~/linodes/components/Backup';
import { testData } from '~/../test/data';

describe('linodes/components/Backup', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders a Backup', () => {
    const backup = mount(
      <Backup
        backup={testData._backups.backups.backup_54778593}
        selected={false}
        onSelect={() => {}}
      />
    );

    expect(backup.find(<div className="title">06/09/2016</div>)).to.exist;
    expect(backup.find('<div>Thursday, June 9 2016 3:05 PM</div>')).to.exist;
  });
});
