import {
  ObjectStorageKey,
  RegionS3EndpointAndID,
} from '@linode/api-v4/lib/object-storage';

import React from 'react';

import { OpenAccessDrawer } from '../types';

import { AccessKeyTableRow } from './AccessKeyTableRow';

type Props = {
  objectStorageKeys: ObjectStorageKey[];
  openDrawer: OpenAccessDrawer;
  openRevokeDialog: (objectStorageKey: ObjectStorageKey) => void;
  setHostNames: (hostNames: RegionS3EndpointAndID[]) => void;
  setShowHostNamesDrawers: (show: boolean) => void;
};

export const AccessKeyTableRows = ({
  objectStorageKeys,
  openDrawer,
  openRevokeDialog,
  setHostNames,
  setShowHostNamesDrawers,
}: Props) => {
  return (
    <>
      {objectStorageKeys.map((eachKey: ObjectStorageKey, index) => (
        <AccessKeyTableRow
          storageKeyData={eachKey}
          openDrawer={openDrawer}
          openRevokeDialog={openRevokeDialog}
          setHostNames={setHostNames}
          setShowHostNamesDrawers={setShowHostNamesDrawers}
          key={index}
        />
      ))}
    </>
  );
};
