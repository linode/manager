import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const linodeInterface: PartialEventMap<'interface'> = {
  interface_create: {
    failed: (e) => (
      <>
        Linode Interface {e.entity!.id} could <strong>not</strong> be{' '}
        <strong>created</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Linode Interface <EventLink event={e} to="entity" /> has been{' '}
        <strong>created</strong> for Linode{' '}
        <EventLink event={e} to="secondaryEntity" />.
      </>
    ),
    scheduled: (e) => (
      <>
        Linode Interface {e.entity!.id} is scheduled for{' '}
        <strong>creation</strong>.
      </>
    ),
    started: (e) => (
      <>
        Linode Interface {e.entity!.id} is being <strong>created</strong>.
      </>
    ),
  },
  interface_delete: {
    failed: (e) => (
      <>
        Linode Interface {e.entity!.id} could <strong>not</strong> be{' '}
        <strong>deleted</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Linode Interface <EventLink event={e} to="entity" /> has been{' '}
        <strong>deleted</strong> from Linode{' '}
        <EventLink event={e} to="secondaryEntity" />.
      </>
    ),
    scheduled: (e) => (
      <>
        Linode Interface {e.entity!.id} is scheduled for{' '}
        <strong>deletion</strong>.
      </>
    ),
    started: (e) => (
      <>
        Linode Interface {e.entity!.id} is being <strong>deleted</strong>.
      </>
    ),
  },
  interface_update: {
    failed: (e) => (
      <>
        Linode Interface {e.entity!.id} could <strong>not</strong> be{' '}
        <strong>updated</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Linode Interface <EventLink event={e} to="entity" /> has been{' '}
        <strong>updated</strong> from Linode{' '}
        <EventLink event={e} to="secondaryEntity" />.
      </>
    ),
    scheduled: (e) => (
      <>
        Linode Interface {e.entity!.id} is scheduled for{' '}
        <strong>updating</strong>.
      </>
    ),
    started: (e) => (
      <>
        Linode Interface {e.entity!.label} is being <strong>updated</strong>.
      </>
    ),
  },
};
