import { Entity, Event } from 'linode-js-sdk/lib/account';

export interface ExtendedEvent extends Event {
  _deleted?: string;
  _initial?: boolean;
}

export interface EntityEvent extends Omit<Event, 'entity'> {
  entity: Entity;
}
