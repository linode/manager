import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const user: PartialEventMap<'user'> = {
  user_create: {
    notification: (e) => (
      <>
        User <EventLink event={e} to="entity" /> has been{' '}
        <strong>created</strong>.
      </>
    ),
  },
  user_delete: {
    notification: (e) => (
      <>
        User {e.entity?.label} has been <strong>deleted</strong>.
      </>
    ),
  },
  user_ssh_key_add: {
    notification: () => (
      <>
        An SSH key has been <strong>added</strong> to your profile.
      </>
    ),
  },
  user_ssh_key_delete: {
    notification: () => (
      <>
        An SSH key has been <strong>deleted</strong> from your profile.
      </>
    ),
  },
  user_ssh_key_update: {
    notification: (e) => (
      <>
        SSH key <EventLink event={e} to="entity" /> has been{' '}
        <strong>updated</strong> in your profile.
      </>
    ),
  },
  user_update: {
    notification: (e) => (
      <>
        User <EventLink event={e} to="entity" /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
};
