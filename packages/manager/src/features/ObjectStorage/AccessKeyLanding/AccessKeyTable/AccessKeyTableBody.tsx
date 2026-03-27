import React from 'react';

import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';

import { AccessKeyTableRow } from './AccessKeyTableRow';

import type { APIError, ObjectStorageKey } from '@linode/api-v4';

interface Props {
  data: ObjectStorageKey[] | undefined;
  error: APIError[] | null | undefined;
  isLoading: boolean;
  isObjMultiClusterEnabled: boolean;
  isRestrictedUser: boolean;
  openRevokeDialog: (objectStorageKey: ObjectStorageKey) => void;
}

export const AccessKeyTableBody = (props: Props) => {
  const {
    data,
    error,
    isLoading,
    isObjMultiClusterEnabled,
    isRestrictedUser,
    openRevokeDialog,
  } = props;

  const cols = isObjMultiClusterEnabled ? 4 : 3;

  if (isRestrictedUser) {
    return <TableRowEmpty colSpan={cols} />;
  }

  if (isLoading) {
    return (
      <TableRowLoading
        columns={cols}
        responsive={isObjMultiClusterEnabled ? { 2: { smDown: true } } : {}}
      />
    );
  }

  if (error) {
    return (
      <TableRowError
        colSpan={cols}
        message="We were unable to load your Access Keys."
      />
    );
  }

  if (data?.length === 0) {
    return <TableRowEmpty colSpan={cols} />;
  }

  return data?.map((key) => (
    <AccessKeyTableRow
      key={key.id}
      openRevokeDialog={openRevokeDialog}
      storageKeyData={key}
    />
  ));
};
