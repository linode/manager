import { truncateEnd, truncateMiddle } from '@linode/utilities';
import * as React from 'react';

import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { useWindowDimensions } from 'src/hooks/useWindowDimensions';

import { displayName, isEmptyObjectForFolder, isFolder } from '../utilities';
import { FolderTableRow } from './FolderTableRow';
import { ObjectTableRow } from './ObjectTableRow';

import type {
  ObjectStorageObject,
  ObjectStorageObjectList,
} from '@linode/api-v4';
import type { APIError } from '@linode/api-v4/lib/types';

interface Props {
  data: ObjectStorageObjectList[];
  error?: APIError[];
  handleClickDelete: (objectName: string) => void;
  handleClickDetails: (object: ObjectStorageObject) => void;
  handleClickDownload: (objectName: string, newTab: boolean) => void;
  isFetching: boolean;
  isFetchingNextPage: boolean;
  numOfDisplayedObjects: number;
  prefix: any;
}

const ObjectTableContent: React.FC<Props> = (props) => {
  const {
    data,
    error,
    handleClickDelete,
    handleClickDetails,
    handleClickDownload,
    isFetching,
    isFetchingNextPage,
    numOfDisplayedObjects,
    prefix,
  } = props;

  const { width } = useWindowDimensions();

  if (isFetching && !isFetchingNextPage) {
    return <TableRowLoading columns={4} responsive={{ 2: { mdDown: true } }} />;
  }

  if (error) {
    return (
      <TableRowError
        colSpan={6}
        message="We were unable to load your Objects."
      />
    );
  }

  if (numOfDisplayedObjects === 0) {
    return (
      <TableRowEmpty
        colSpan={6}
        message={prefix ? 'This folder is empty.' : 'This bucket is empty.'}
      />
    );
  }

  // Be more strict with truncation lengths on smaller viewports.
  const maxNameWidth = width < 600 ? 20 : 40;

  return (
    <>
      {data.map((page) => {
        return page.data.map((object) => {
          if (isEmptyObjectForFolder(object)) {
            if (numOfDisplayedObjects === 1) {
              return (
                <TableRowEmpty
                  colSpan={6}
                  key={`empty-${object.name}`}
                  message="This folder is empty."
                />
              );
            }
            return null;
          }

          if (isFolder(object)) {
            return (
              <FolderTableRow
                displayName={truncateEnd(
                  displayName(object.name),
                  maxNameWidth
                )}
                folderName={object.name}
                handleClickDelete={handleClickDelete}
                key={object.name}
              />
            );
          }

          return (
            <ObjectTableRow
              displayName={truncateMiddle(
                displayName(object.name),
                maxNameWidth
              )}
              fullName={object.name}
              /**
               * In reality, if there's no `size` or `last_modified`, we're
               * probably dealing with a folder and will have already returned
               * `null`. The OR fallbacks are to make TSC happy, and to safeguard
               * in the event of the data being something we don't expect.
               */
              handleClickDelete={handleClickDelete}
              handleClickDetails={() => handleClickDetails(object)}
              handleClickDownload={handleClickDownload}
              key={object.name}
              objectLastModified={object.last_modified || ''}
              objectSize={object.size || 0}
            />
          );
        });
      })}
      {isFetchingNextPage ? (
        <TableRowLoading columns={4} responsive={{ 2: { mdDown: true } }} />
      ) : null}
    </>
  );
};

export default React.memo(ObjectTableContent);
