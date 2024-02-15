import React from 'react';
import {
  ObjectStorageKey,
  RegionS3EndpointAndID,
} from '@linode/api-v4/lib/object-storage';
import { APIError } from '@linode/api-v4/lib/types';

import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { AccessKeyTableRows } from './AccessKeyTableRows';
import { OpenAccessDrawer } from '../types';

type Props = {
  data: ObjectStorageKey[] | undefined;
  error: APIError[] | null | undefined;
  isLoading: boolean;
  isRestrictedUser: boolean;
  openDrawer: OpenAccessDrawer;
  openRevokeDialog: (objectStorageKey: ObjectStorageKey) => void;
  setHostNames: (hostNames: RegionS3EndpointAndID[]) => void;
  setShowHostNamesDrawers: (show: boolean) => void;
};

export const AccessKeyTableBody = ({
  data,
  error,
  isLoading,
  isRestrictedUser,
  openDrawer,
  openRevokeDialog,
  setHostNames,
  setShowHostNamesDrawers,
}: Props) => {
  if (isRestrictedUser) {
    return <TableRowEmpty colSpan={12} />;
  }

  if (isLoading) {
    return <TableRowLoading columns={3} />;
  }

  if (error) {
    return (
      <TableRowError
        colSpan={6}
        message="We were unable to load your Access Keys."
      />
    );
  }

  return (
    <>
      {data && data.length > 0 ? (
        <AccessKeyTableRows
          objectStorageKeys={data}
          openDrawer={openDrawer}
          openRevokeDialog={openRevokeDialog}
          setHostNames={setHostNames}
          setShowHostNamesDrawers={setShowHostNamesDrawers}
        />
      ) : (
        <TableRowEmpty colSpan={12} />
      )}
    </>
  );
};
