import sinon from 'sinon';
import { expect } from 'chai';

import { Event } from '~/api/objects/Event';
import {
  testEvent,
  linodeShutdownEvent,
  linodeBootEvent,
  unrecognizedEvent,
} from '@/data/events';

describe('api/objects/Event', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should return the correct status', () => {
    const event = new Event(testEvent);
    expect(event.getStatus()).to.equal('running');
  });

  it('should return updated and created fields as Date objects', () => {
    const event = new Event(testEvent);
    const updatedAt = event.getUpdatedAt();
    const createdAt = event.getCreatedAt();
    expect(updatedAt.valueOf()).to.equal((new Date(testEvent.updated)).valueOf());
    expect(createdAt.valueOf()).to.equal((new Date(testEvent.created)).valueOf());
  });

  it('should return the Event type', () => {
    const event = new Event(testEvent);
    expect(event.getType()).to.equal(Event.LINODE_REBOOT);
  });

  it('should return the progress', () => {
    const event = new Event(testEvent);
    expect(event.getProgress()).to.equal(100);
  });

  it('should return the linode id', () => {
    const event = new Event(testEvent);
    expect(event.getLinodeId()).to.equal(testEvent.linode_id);
  });

  it('should return the offline status for linode_shutdown', () => {
    const event = new Event(linodeShutdownEvent);
    expect(event.getStatus()).to.equal('offline');
  });

  it('should return the running status for linode_boot', () => {
    const event = new Event(linodeBootEvent);
    expect(event.getStatus()).to.equal('running');
  });

  it('should return empty string for unrecognized status', () => {
    const event = new Event(unrecognizedEvent);
    expect(event.getStatus()).to.equal('');
  });
});
