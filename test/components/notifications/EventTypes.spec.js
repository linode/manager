import { expect } from 'chai';

import {
  EventTypeMap,
  baseRedirect,
  getLinodeRedirectUrl,
  getDiskRedirectUrl,
  getBackupRedirectUrl,
} from '~/components/notifications';
import { api } from '@/data';

describe('components/notifications/EventTypes', () => {
  it('should define a type map', () => {
    expect(EventTypeMap).to.be.defined;
  });

  it('should provide a base redirect url', () => {
    expect(baseRedirect()).to.equal('/linodes');
  });

  it('should create a linode redirect url', () => {
    const event = api.events.events[385];
    expect(getLinodeRedirectUrl(event.entity)).to.equal('/linodes/linode-www2');
  });

  it('should create a disk redirect url', () => {
    const event = api.events.events[385];
    expect(getDiskRedirectUrl(event.entity)).to.equal('/linodes/linode-www2/settings/advanced');
  });

  it('should create a backups redirect url', () => {
    const event = api.events.events[385];
    expect(getBackupRedirectUrl(event.entity)).to.equal('/linodes/linode-www2/backups');
  });
});
