import * as React from 'react';

import { EventLink } from '../EventLink';
import { FormattedEventMessage } from '../FormattedEventMessage';

import type { PartialEventMap } from '../types';

export const image: PartialEventMap<'image'> = {
  image_delete: {
    failed: (e) => (
      <>
        Image <EventLink event={e} to="entity" /> could <strong>not</strong> be{' '}
        <strong>deleted</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Image {e.entity?.label} has been <strong>deleted</strong>.
      </>
    ),
    notification: (e) => (
      <>
        Image {e.entity?.label} has been <strong>deleted</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Image <EventLink event={e} to="entity" /> is scheduled to be{' '}
        <strong>deleted</strong>.
      </>
    ),
    started: (e) => (
      <>
        Image <EventLink event={e} to="entity" /> is being{' '}
        <strong>deleted</strong>.
      </>
    ),
  },
  image_update: {
    notification: (e) => (
      <>
        Image <EventLink event={e} to="entity" /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
  image_upload: {
    failed: (e) => {
      const message = e?.message?.replace(/(\d+)/g, '$1 MB') || '';

      return (
        <>
          Image <EventLink event={e} to="entity" /> could <strong>not</strong>{' '}
          be <strong>uploaded</strong>:{' '}
          <FormattedEventMessage message={message} />
        </>
      );
    },

    finished: (e) => (
      <>
        Image <EventLink event={e} to="entity" /> is now available.
      </>
    ),
    notification: (e) => (
      <>
        Image <EventLink event={e} to="entity" /> has been{' '}
        <strong>uploaded</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Image <EventLink event={e} to="entity" /> is scheduled for{' '}
        <strong>upload</strong>.
      </>
    ),
    started: (e) => (
      <>
        Image <EventLink event={e} to="entity" /> is being{' '}
        <strong>uploaded</strong>.
      </>
    ),
  },
  image_sharegroup_add_image: {
    notification: (e) => (
      <>
        Image {e.entity?.label} has been <strong>added</strong> to share group{' '}
        <EventLink event={e} to="secondaryEntity" />.
      </>
    ),
  },
  image_sharegroup_add_member: {
    notification: (e) => (
      <>
        User {e.secondary_entity?.label} has been <strong>added</strong> to the{' '}
        <EventLink event={e} to="entity" /> share group.
      </>
    ),
  },
  image_sharegroup_create: {
    notification: (e) => (
      <>
        Share group <EventLink event={e} to="entity" /> has been{' '}
        <strong>created</strong>.
      </>
    ),
  },
  image_sharegroup_delete: {
    notification: (e) => (
      <>
        Share group <EventLink event={e} to="entity" /> has been{' '}
        <strong>deleted</strong>.
      </>
    ),
  },
  image_sharegroup_member_token_accept: {
    notification: (e) => (
      <>
        User {e.secondary_entity?.label} has been <strong>added</strong> to the{' '}
        <EventLink event={e} to="entity" /> share group.
      </>
    ),
  },
  image_sharegroup_member_token_create: {
    notification: (e) => (
      <>
        Token to request a share group {e.entity?.id} membership has been{' '}
        <strong>generated</strong> successfully.
      </>
    ),
  },
  image_sharegroup_member_token_delete: {
    notification: (e) => (
      <>
        Membership request for the share group {e.entity?.id} has been{' '}
        <strong>cancelled</strong>.
      </>
    ),
  },
  image_sharegroup_member_token_update: {},
  image_sharegroup_remove_image: {
    notification: (e) => (
      <>
        Image {e.entity?.label} has been <strong>removed</strong> from the{' '}
        <EventLink event={e} to="secondaryEntity" /> share group.
      </>
    ),
  },
  image_sharegroup_remove_member: {
    notification: (e) => (
      <>
        User {e.secondary_entity?.label}&apos;s access to the{' '}
        <EventLink event={e} to="entity" /> share group has been{' '}
        <strong>revoked</strong>.
      </>
    ),
  },
  image_sharegroup_token_expired: {
    notification: (e) => (
      <>
        Token to request a share group {e.entity?.id} membership has{' '}
        <strong>expired</strong>.
      </>
    ),
  },
  image_sharegroup_token_revoke: {
    notification: (e) => (
      <>
        User {e.secondary_entity?.label}&apos;s access to the{' '}
        <EventLink event={e} to="entity" /> share group has been{' '}
        <strong>revoked</strong>.
      </>
    ),
  },
  image_sharegroup_update: {
    notification: (e) => (
      <>
        Share group <EventLink event={e} to="entity" /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
  image_sharegroup_update_image: {
    notification: (e) => (
      <>
        {e.entity?.label} has been <strong>updated</strong> in the{' '}
        <EventLink event={e} to="secondaryEntity" /> share group.
      </>
    ),
  },
  image_sharegroup_update_member: {},
};
