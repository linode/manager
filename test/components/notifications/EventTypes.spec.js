import { expect } from 'chai';

import {
  EventTypeMap,
  baseRedirect,
  getLinodeRedirectUrl,
  getDiskRedirectUrl,
  getBackupRedirectUrl,
} from '~/components/notifications';

describe('components/notifications/EventTypes', () => {
  it('should define a type map', () => {
    expect(EventTypeMap).to.be.defined;
  });

  it('should provide a base redirect url', () => {
    expect(baseRedirect()).to.equal('/linodes');
  });

  it('should create a linode redirect url', () => {
    expect(getLinodeRedirectUrl('example')).to.equal('/linodes/example');
  });

  it('should create a disk redirect url', () => {
    expect(getDiskRedirectUrl('example')).to.equal('/linodes/example/settings/advanced');
  });

  it('should create a backups redirect url', () => {
    expect(getBackupRedirectUrl('example')).to.equal('/linodes/example/backups');
  });
});
