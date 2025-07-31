import { getObjectList, getObjectURL } from '@linode/api-v4/lib/object-storage';
import { useAccount } from '@linode/queries';
import { ActionsPanel, Box } from '@linode/ui';
import { Hidden } from '@linode/ui';
import { isFeatureEnabledV2, truncateMiddle } from '@linode/utilities';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, useSearch } from '@tanstack/react-router';
import produce from 'immer';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Waypoint } from 'react-waypoint';
import { debounce } from 'throttle-debounce';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { ObjectUploader } from 'src/components/Uploaders/ObjectUploader/ObjectUploader';
import { OBJECT_STORAGE_DELIMITER } from 'src/constants';
import { useFlags } from 'src/hooks/useFlags';
import {
  getObjectBucketObjectsQueryKey,
  objectStorageQueries,
  useObjectBucketObjectsInfiniteQuery,
  useObjectStorageBuckets,
} from 'src/queries/object-storage/queries';
import { fetchBucketAndUpdateCache } from 'src/queries/object-storage/utilities';
import { sendDownloadObjectEvent } from 'src/utilities/analytics/customEventAnalytics';

import { deleteObject as _deleteObject } from '../requests';
import {
  displayName,
  generateObjectUrl,
  isEmptyObjectForFolder,
  tableUpdateAction,
} from '../utilities';
import { BucketBreadcrumb } from './BucketBreadcrumb';
import {
  StyledCreateFolderButton,
  StyledErrorFooter,
  StyledFooter,
  StyledNameColumn,
  StyledSizeColumn,
  StyledTryAgainButton,
} from './BucketDetail.styles';
import { CreateFolderDrawer } from './CreateFolderDrawer';
import { ObjectDetailsDrawer } from './ObjectDetailsDrawer';
import ObjectTableContent from './ObjectTableContent';

import type {
  ObjectStorageObject,
  ObjectStorageObjectList,
} from '@linode/api-v4';
import type { InfiniteData } from '@tanstack/react-query';

export const BucketDetail = () => {
  /**
   * @note If `Object Storage Access Key Regions` is enabled, clusterId will actually contain
   * the bucket's region id
   */
  const { enqueueSnackbar } = useSnackbar();
  const { bucketName, clusterId } = useParams({
    from: '/object-storage/buckets/$clusterId/$bucketName',
  });
  const { prefix = '' } = useSearch({
    from: '/object-storage/buckets/$clusterId/$bucketName',
  });
  const queryClient = useQueryClient();

  const flags = useFlags();
  const { data: account } = useAccount();

  const isObjMultiClusterEnabled = isFeatureEnabledV2(
    'Object Storage Access Key Regions',
    Boolean(flags.objMultiCluster),
    account?.capabilities ?? []
  );

  const { data: buckets } = useObjectStorageBuckets();

  const bucket = buckets?.buckets.find((bucket) => {
    if (isObjMultiClusterEnabled) {
      return bucket.label === bucketName && bucket.region === clusterId;
    }
    return bucket.label === bucketName && bucket.cluster === clusterId;
  });

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = useObjectBucketObjectsInfiniteQuery(clusterId, bucketName, prefix);
  const [isCreateFolderDrawerOpen, setIsCreateFolderDrawerOpen] =
    React.useState(false);
  const [objectToDelete, setObjectToDelete] = React.useState<string>();
  const [deleteObjectError, setDeleteObjectError] = React.useState<string>();
  const [deleteObjectDialogOpen, setDeleteObjectDialogOpen] =
    React.useState<boolean>(false);
  const [selectedObject, setSelectedObject] =
    React.useState<ObjectStorageObject>();
  const [objectDetailDrawerOpen, setObjectDetailDrawerOpen] =
    React.useState<boolean>(false);
  const [deleteObjectLoading, setDeleteObjectLoading] =
    React.useState<boolean>(false);

  const handleDownload = async (objectName: string) => {
    try {
      const { url } = await getObjectURL(
        clusterId,
        bucketName,
        objectName,
        'GET',
        // Force download with content_disposition: attachment
        { content_disposition: 'attachment' }
      );

      sendDownloadObjectEvent();

      window.location.assign(url);
    } catch (err) {
      enqueueSnackbar('Error downloading Object', {
        variant: 'error',
      });
    }
  };

  const handleClickDelete = (objectName: string) => {
    setObjectToDelete(objectName);
    setDeleteObjectError(undefined);
    setDeleteObjectDialogOpen(true);
  };

  const handleClickDetails = (selectedObject: ObjectStorageObject) => {
    setSelectedObject(selectedObject);
    setObjectDetailDrawerOpen(true);
  };

  // If a user deletes many objects in a short amount of time,
  // we don't want to fetch for every delete action. Debounce
  // the updateBucket call by 3 seconds.
  const debouncedUpdateBucket = debounce(3000, false, () => {
    fetchBucketAndUpdateCache(clusterId, bucketName, queryClient);
  });

  const deleteObject = async () => {
    if (!objectToDelete) {
      return;
    }

    setDeleteObjectLoading(true);
    setDeleteObjectError(undefined);

    if (objectToDelete.endsWith('/')) {
      const itemsInFolderData = await getObjectList({
        bucket: bucketName,
        clusterId,
        params: {
          delimiter: OBJECT_STORAGE_DELIMITER,
          prefix: objectToDelete,
        },
      });

      // Exclude the empty object the represents a folder so we can
      // find the true number of objects on the page
      const itemsInFolder = itemsInFolderData.data.filter(
        (object) =>
          !isEmptyObjectForFolder(object) &&
          !objectToDelete.endsWith(object.name)
      );

      if (itemsInFolder.length > 0) {
        setDeleteObjectLoading(false);
        setDeleteObjectError('The folder must be empty to delete it.');
        return;
      }
    }

    try {
      const { url } = await getObjectURL(
        clusterId,
        bucketName,
        objectToDelete,
        'DELETE'
      );

      await _deleteObject(url);

      // Update this bucket so the buckets landing page shows the correct
      // bucket size and object count.
      debouncedUpdateBucket();

      setDeleteObjectLoading(false);
      setDeleteObjectDialogOpen(false);
      removeOne(objectToDelete);
    } catch (err) {
      setDeleteObjectLoading(false);
      // We are unlikely to get back a helpful error message, so we create a
      // generic one here.
      setDeleteObjectError('Unable to delete object.');
    }
  };

  const updateStore = (pages: ObjectStorageObjectList[]) => {
    queryClient.setQueryData<{
      pageParams: string[];
      pages: ObjectStorageObjectList[];
    }>(
      getObjectBucketObjectsQueryKey(clusterId, bucketName, prefix),
      (data) => ({
        pageParams: data?.pageParams || [],
        pages,
      })
    );
  };

  const removeOne = (objectName: string) => {
    const newPagesArray = produce(data?.pages, (draft) => {
      let objectIndex = -1;
      const pageIndex = draft?.findIndex((thisPage) => {
        const _objectIndex = thisPage.data.findIndex(
          (object) => object.name === objectName
        );
        objectIndex = _objectIndex !== -1 ? _objectIndex : -1;
        return _objectIndex !== -1;
      });
      if (draft && pageIndex !== undefined && pageIndex !== -1) {
        draft[pageIndex].data.splice(objectIndex, 1);
      }
      return draft;
    });
    updateStore(newPagesArray ?? []);
  };

  const maybeAddObjectToTable = (path: string, sizeInBytes: number) => {
    const action = tableUpdateAction(prefix, path);
    if (action) {
      if (action.type === 'FILE') {
        addOneFile(action.name, sizeInBytes);
      } else {
        addOneFolder(action.name);
      }
    }
  };

  const addOneFile = (objectName: string, sizeInBytes: number) => {
    const currentData = queryClient.getQueryData<
      InfiniteData<ObjectStorageObjectList>
    >(getObjectBucketObjectsQueryKey(clusterId, bucketName, prefix));

    if (!currentData) {
      return;
    }

    const object: ObjectStorageObject = {
      etag: '',
      last_modified: new Date().toISOString(),
      name: prefix + objectName,
      owner: '',
      size: sizeInBytes,
    };

    for (let i = 0; i < currentData.pages.length; i++) {
      const foundObjectIndex = currentData.pages[i].data.findIndex(
        (_object) => _object.name === object.name
      );
      if (foundObjectIndex !== -1) {
        const copy = [...currentData.pages];
        const pageCopy = [...currentData.pages[i].data];

        pageCopy[foundObjectIndex] = object;

        copy[i].data = pageCopy;

        updateStore(copy);

        return;
      }
    }

    const copy = [...currentData.pages];
    const dataCopy = [...copy[copy.length - 1].data];

    dataCopy.push(object);
    copy[copy.length - 1] = {
      ...copy[copy.length - 1],
      data: dataCopy,
    };

    updateStore(copy);
  };

  const addOneFolder = (objectName: string) => {
    const currentData = queryClient.getQueryData<
      InfiniteData<ObjectStorageObjectList>
    >(getObjectBucketObjectsQueryKey(clusterId, bucketName, prefix));

    if (!currentData) {
      return;
    }

    const folder: ObjectStorageObject = {
      etag: null,
      last_modified: null,
      name: `${prefix + objectName}/`,
      owner: null,
      size: null,
    };

    for (const page of currentData.pages) {
      if (page.data.find((object) => object.name === folder.name)) {
        // If a folder already exists in the store, invalidate that store for that specific
        // prefix. Due to how invalidateQueries works, all subdirectories also get invalidated.
        queryClient.invalidateQueries({
          queryKey: [
            ...objectStorageQueries.bucket(clusterId, bucketName)._ctx.objects
              .queryKey,
            ...`${prefix}${objectName}`.split('/'),
          ],
        });
        return;
      }
    }

    const copy = [...currentData.pages];
    const dataCopy = [...copy[copy.length - 1].data];

    dataCopy.push(folder);
    copy[copy.length - 1].data = dataCopy;

    updateStore(copy);
  };

  const closeDeleteObjectDialog = () => {
    setDeleteObjectDialogOpen(false);
  };

  const closeObjectDetailsDrawer = () => {
    setObjectDetailDrawerOpen(false);
  };

  const numOfDisplayedObjects =
    data?.pages.map((page) => page.data.length).reduce((a, b) => a + b, 0) || 0;

  if (!bucketName || !clusterId) {
    return null;
  }

  return (
    <>
      <DocumentTitleSegment segment={`${bucketName} | Bucket`} />
      <BucketBreadcrumb bucketName={bucketName} prefix={prefix} />
      <ObjectUploader
        bucketName={bucketName}
        clusterId={clusterId}
        maybeAddObjectToTable={maybeAddObjectToTable}
        prefix={prefix}
      />
      <Box display="flex" justifyContent="flex-end" mb={0.5} mt={1.5}>
        <StyledCreateFolderButton
          buttonType="outlined"
          onClick={() => setIsCreateFolderDrawerOpen(true)}
        >
          Create Folder
        </StyledCreateFolderButton>
      </Box>
      <Table aria-label="List of Bucket Objects">
        <TableHead>
          <TableRow>
            <StyledNameColumn>Object</StyledNameColumn>
            <StyledSizeColumn>Size</StyledSizeColumn>
            <Hidden mdDown>
              <TableCell>Last Modified</TableCell>
            </Hidden>
            {/* Empty TableCell for Action Menu */}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          <ObjectTableContent
            data={data?.pages || []}
            error={error ? error : undefined}
            handleClickDelete={handleClickDelete}
            handleClickDetails={handleClickDetails}
            handleClickDownload={handleDownload}
            isFetching={isFetching}
            isFetchingNextPage={isFetchingNextPage}
            numOfDisplayedObjects={numOfDisplayedObjects}
            prefix={prefix}
          />
        </TableBody>
      </Table>
      {/* We shouldn't allow infinite scrolling if we're still loading,
              if we've gotten all objects in the bucket (or folder), or if there
              are errors. */}
      {!isLoading && !isFetchingNextPage && !error && hasNextPage && (
        <Waypoint onEnter={() => fetchNextPage()}>
          <div />
        </Waypoint>
      )}
      {error && (
        <StyledErrorFooter variant="subtitle2">
          The next objects in the list failed to load.{' '}
          <StyledTryAgainButton onClick={() => fetchNextPage()}>
            Click here to try again.
          </StyledTryAgainButton>
        </StyledErrorFooter>
      )}
      {!hasNextPage && numOfDisplayedObjects >= 100 && (
        <StyledFooter variant="subtitle2">
          Showing all {numOfDisplayedObjects} items
        </StyledFooter>
      )}
      <ConfirmationDialog
        actions={() => (
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit-rebuild',
              label: 'Delete',
              loading: deleteObjectLoading,
              onClick: deleteObject,
            }}
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: 'Cancel',
              onClick: closeDeleteObjectDialog,
            }}
          />
        )}
        error={deleteObjectError}
        onClose={closeDeleteObjectDialog}
        open={deleteObjectDialogOpen}
        title={
          objectToDelete
            ? `Delete ${truncateMiddle(displayName(objectToDelete))}`
            : 'Delete object'
        }
      >
        Are you sure you want to delete this object?
      </ConfirmationDialog>
      <ObjectDetailsDrawer
        bucketName={bucketName}
        clusterId={clusterId}
        displayName={selectedObject?.name}
        lastModified={selectedObject?.last_modified}
        name={selectedObject?.name}
        onClose={closeObjectDetailsDrawer}
        open={objectDetailDrawerOpen}
        size={selectedObject?.size}
        url={
          selectedObject && bucket
            ? generateObjectUrl(bucket.hostname, selectedObject.name)
            : undefined
        }
      />
      <CreateFolderDrawer
        bucketName={bucketName}
        clusterId={clusterId}
        maybeAddObjectToTable={maybeAddObjectToTable}
        onClose={() => setIsCreateFolderDrawerOpen(false)}
        open={isCreateFolderDrawerOpen}
        prefix={prefix}
      />
    </>
  );
};
