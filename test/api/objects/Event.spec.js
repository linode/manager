import sinon from 'sinon';
import { expect } from 'chai';

import { testEvent } from '@/data/events';
import { Event } from '~/api/objects/Event';

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
});
