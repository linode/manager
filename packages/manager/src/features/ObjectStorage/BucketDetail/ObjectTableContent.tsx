import {
  ObjectStorageObject,
  ObjectStorageObjectListResponse,
} from '@linode/api-v4';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { useWindowDimensions } from 'src/hooks/useWindowDimensions';
import { truncateEnd, truncateMiddle } from 'src/utilities/truncate';
import { displayName, isFolder } from '../utilities';
import FolderTableRow from './FolderTableRow';
import ObjectTableRow from './ObjectTableRow';

interface Props {
  data: ObjectStorageObjectListResponse[];
  isFetching: boolean;
  isFetchingNextPage: boolean;
  error?: APIError[];
  handleClickDownload: (objectName: string, newTab: boolean) => void;
  handleClickDelete: (objectName: string) => void;
  handleClickDetails: (object: ObjectStorageObject) => void;
  numOfDisplayedObjects: number;
  prefix: any;
}

const ObjectTableContent: React.FC<Props> = (props) => {
  const {
    data,
    isFetching,
    isFetchingNextPage,
    error,
    handleClickDownload,
    handleClickDelete,
    handleClickDetails,
    numOfDisplayedObjects,
    prefix,
  } = props;

  const { width } = useWindowDimensions();

  if (isFetching && !isFetchingNextPage) {
    return <TableRowLoading columns={4} responsive={{ 2: { smDown: true } }} />;
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
      <TableRowEmptyState
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
          if (isFolder(object)) {
            return (
              <FolderTableRow
                key={object.name}
                folderName={object.name}
                displayName={truncateEnd(
                  displayName(object.name),
                  maxNameWidth
                )}
                manuallyCreated={false}
              />
            );
          }

          return (
            <ObjectTableRow
              key={object.name}
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
              objectSize={object.size || 0}
              objectLastModified={object.last_modified || ''}
              manuallyCreated={false}
              handleClickDownload={handleClickDownload}
              handleClickDelete={handleClickDelete}
              handleClickDetails={() => handleClickDetails(object)}
            />
          );
        });
      })}
      {isFetchingNextPage ? (
        <TableRowLoading columns={4} responsive={{ 2: { smDown: true } }} />
      ) : null}
    </>
  );
};

export default React.memo(ObjectTableContent);
