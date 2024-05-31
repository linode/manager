import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const stackscript: PartialEventMap<'stackscript'> = {
  stackscript_create: {
    notification: (e) => (
      <>
        StackScript <EventLink event={e} to="entity" /> has been{' '}
        <strong>created</strong>.
      </>
    ),
  },
  stackscript_delete: {
    notification: (e) => (
      <>
        StackScript {e.entity?.label} has been <strong>deleted</strong>.
      </>
    ),
  },
  stackscript_publicize: {
    notification: (e) => (
      <>
        StackScript <EventLink event={e} to="entity" /> has been{' '}
        <strong>made public</strong>.
      </>
    ),
  },
  stackscript_revise: {
    notification: (e) => (
      <>
        StackScript <EventLink event={e} to="entity" /> has been{' '}
        <strong>revised</strong>.
      </>
    ),
  },
  stackscript_update: {
    notification: (e) => (
      <>
        StackScript <EventLink event={e} to="entity" /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
};
