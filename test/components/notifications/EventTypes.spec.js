import { expect } from 'chai';

import {
  EventTypeMap,
  baseRedirect,
  getLinodeRedirectUrl,
  getLinodeAdvancedRedirectUrl,
  getLinodeBackupRedirectUrl,
} from '~/components/notifications';
import { api } from '@/data';

const events = api.events;

describe('components/notifications/EventTypes', () => {
  it('should define a type map', () => {
    expect(EventTypeMap).to.be.defined;
    expect(EventTypeMap).to.be.an('object');
  });

  it('should provide a base redirect url', () => {
    expect(baseRedirect()).to.equal('/');
  });

  it('should create a linode redirect url', () => {
    const event = events.events[385];
    expect(getLinodeRedirectUrl(event.entity)).to.equal('/linodes/linode-www2');
  });

  it('should create a disk redirect url', () => {
    const event = events.events[385];
    expect(getLinodeAdvancedRedirectUrl(event.entity))
      .to.equal('/linodes/linode-www2/settings/advanced');
  });

  it('should create a backups redirect url', () => {
    const event = events.events[385];
    expect(getLinodeBackupRedirectUrl(event.entity)).to.equal('/linodes/linode-www2/backups');
  });
});
