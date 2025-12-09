import * as React from 'react';

import { EventLink } from '../EventLink';
import { FormattedEventMessage } from '../FormattedEventMessage';

import type { PartialEventMap } from '../types';

export const domain: PartialEventMap<'domain'> = {
  domain_create: {
    notification: (e) => (
      <>
        Domain <EventLink event={e} to="entity" /> has been{' '}
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
        Domain <EventLink event={e} to="entity" /> has been{' '}
        <strong>imported</strong>.
      </>
    ),
  },
  domain_record_create: {
    notification: (e) => {
      return (
        <>
          <FormattedEventMessage fallback="A record" message={e.message} /> has
          been <strong>added</strong> to <EventLink event={e} to="entity" />.
        </>
      );
    },
  },
  domain_record_delete: {
    notification: (e) => (
      <>
        A domain record has been <strong>deleted</strong> from{' '}
        <EventLink event={e} to="entity" />.
      </>
    ),
  },
  domain_record_update: {
    notification: (e) => (
      <>
        <FormattedEventMessage message={e.message} /> has been{' '}
        <strong>updated</strong> for <EventLink event={e} to="entity" />.
      </>
    ),
  },
  domain_record_updated: {
    notification: (e) => (
      <>
        <FormattedEventMessage message={e.message} /> has been{' '}
        <strong>updated</strong> for <EventLink event={e} to="entity" />.
      </>
    ),
  },
  domain_update: {
    notification: (e) => (
      <>
        Domain <EventLink event={e} to="entity" /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
};
