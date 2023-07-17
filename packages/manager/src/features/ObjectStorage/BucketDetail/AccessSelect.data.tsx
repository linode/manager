import * as React from 'react';

import ExternalLink from 'src/components/ExternalLink';

import type { ACLType } from '@linode/api-v4';

export const copy: Record<
  'bucket' | 'object',
  Partial<Record<ACLType, JSX.Element>>
> = {
  bucket: {
    'authenticated-read': (
      <>
        <strong>All authenticated Object Storage users </strong> can list
        Objects in this Bucket, but only you can create, overwrite, and delete
        them.
      </>
    ),
    custom: (
      <>
        This Bucket has a custom ACL. Use{' '}
        <ExternalLink
          hideIcon
          link="https://www.linode.com/docs/guides/how-to-use-object-storage/#object-storage-tools"
          text="another S3-compatible tool"
        />{' '}
        to edit the ACL, or select a pre-defined ACL here.
      </>
    ),
    private: (
      <>
        <strong>Only you</strong> can list, create, overwrite, and delete
        Objects in this Bucket.
      </>
    ),
    'public-read': (
      <>
        <strong>Everyone </strong> can list Objects in this Bucket, but only you
        can create, overwrite, and delete them.
      </>
    ),
    'public-read-write': (
      <>
        <strong>Everyone </strong> can list, create, overwrite, and delete
        Objects in this Bucket. <strong>This is not recommended.</strong>
      </>
    ),
  },
  object: {
    'authenticated-read': (
      <>
        <strong>All authenticated Object Storage users </strong> can download
        this Object.
      </>
    ),
    custom: (
      <>
        This Object has a custom ACL. Use another{' '}
        <ExternalLink
          hideIcon
          link="https://www.linode.com/docs/guides/how-to-use-object-storage/#object-storage-tools"
          text="S3-compatible tool"
        />{' '}
        to edit the ACL, or select a predefined ACL.
      </>
    ),
    private: (
      <>
        <strong>Only you</strong> can download this Object.
      </>
    ),
    'public-read': (
      <>
        <strong>Everyone </strong> can download this Object.
      </>
    ),
  },
};
