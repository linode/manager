import * as React from 'react';

import { EventMessageLink } from '../EventMessageLink';

import type { PartialEventMap } from '../types';

export const domain: PartialEventMap = {
  domain_create: {
    notification: (e) => (
      <>
        Domain <EventMessageLink event={e} to="entity" /> has been{' '}
        <strong>created</strong>.
      </>
    ),
  },
  domain_delete: {
    notification: (e) => (
      <>
        Domain {e.entity?.label} has been <strong>deleted</strong>.
      </>
    ),
  },
  domain_import: {
    notification: (e) => (
      <>
        Domain <EventMessageLink event={e} to="entity" /> has been{' '}
        <strong>imported</strong>.
      </>
    ),
  },
  domain_record_create: {
    notification: (e) => (
      <>
        {e.message} has been <strong>added</strong> to{' '}
        <EventMessageLink event={e} to="entity" />.
      </>
    ),
  },
  domain_record_delete: {
    notification: (e) => (
      <>
        A domain record has been <strong>deleted</strong> from{' '}
        <EventMessageLink event={e} to="entity" />.
      </>
    ),
  },
  domain_record_update: {
    notification: (e) => (
      <>
        {e.message} has been <strong>updated</strong> for{' '}
        <EventMessageLink event={e} to="entity" />.
      </>
    ),
  },
  domain_update: {
    notification: (e) => (
      <>
        Domain <EventMessageLink event={e} to="entity" /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
};
