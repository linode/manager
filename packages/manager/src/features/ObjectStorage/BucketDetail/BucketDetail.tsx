import {
  ObjectStorageClusterID,
  ObjectStorageObject,
  ObjectStorageObjectListResponse,
  getObjectList,
  getObjectURL,
} from '@linode/api-v4/lib/object-storage';
import produce from 'immer';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { Waypoint } from 'react-waypoint';
import { debounce } from 'throttle-debounce';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Box } from 'src/components/Box';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Hidden } from 'src/components/Hidden';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { OBJECT_STORAGE_DELIMITER } from 'src/constants';
import {
  prefixToQueryKey,
  queryKey,
  updateBucket,
  useObjectBucketDetailsInfiniteQuery,
} from 'src/queries/objectStorage';
import { sendDownloadObjectEvent } from 'src/utilities/analytics';
import { getQueryParamFromQueryString } from 'src/utilities/queryParams';
import { truncateMiddle } from 'src/utilities/truncate';

import { ObjectUploader } from '../ObjectUploader/ObjectUploader';
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

interface MatchParams {
  bucketName: string;
  clusterId: ObjectStorageClusterID;
}

export const BucketDetail = () => {
  const match = useRouteMatch<MatchParams>(
    '/object-storage/buckets/:clusterId/:bucketName'
  );
  const location = useLocation();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const bucketName = match?.params.bucketName || '';
  const clusterId = match?.params.clusterId || '';
  const prefix = getQueryParamFromQueryString(location.search, 'prefix');
  const queryClient = useQueryClient();
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = useObjectBucketDetailsInfiniteQuery(clusterId, bucketName, prefix);
  const [
    isCreateFolderDrawerOpen,
    setIsCreateFolderDrawerOpen,
  ] = React.useState(false);
  const [objectToDelete, setObjectToDelete] = React.useState<string>();
  const [deleteObjectError, setDeleteObjectError] = React.useState<string>();
  const [
    deleteObjectDialogOpen,
    setDeleteObjectDialogOpen,
  ] = React.useState<boolean>(false);
  const [
    selectedObject,
    setSelectedObject,
  ] = React.useState<ObjectStorageObject>();
  const [
    objectDetailDrawerOpen,
    setObjectDetailDrawerOpen,
  ] = React.useState<boolean>(false);
  const [deleteObjectLoading, setDeleteObjectLoading] = React.useState<boolean>(
    false
  );

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
  const debouncedUpdateBucket = debounce(3000, false, () =>
    updateBucket(clusterId, bucketName, queryClient)
  );

  const deleteObject = async () => {
    if (!objectToDelete) {
      return;
    }

    setDeleteObjectLoading(true);
    setDeleteObjectError(undefined);

    if (objectToDelete.endsWith('/')) {
      const itemsInFolderData = await getObjectList(clusterId, bucketName, {
        delimiter: OBJECT_STORAGE_DELIMITER,
        prefix: objectToDelete,
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

  const updateStore = (pages: ObjectStorageObjectListResponse[]) => {
    queryClient.setQueryData<{
      pageParams: string[];
      pages: ObjectStorageObjectListResponse[];
    }>(
      [queryKey, clusterId, bucketName, 'objects', ...prefixToQueryKey(prefix)],
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
    if (!data) {
      return;
    }

    const object: ObjectStorageObject = {
      etag: '',
      last_modified: new Date().toISOString(),
      name: prefix + objectName,
      owner: '',
      size: sizeInBytes,
    };

    for (let i = 0; i < data.pages.length; i++) {
      const foundObjectIndex = data.pages[i].data.findIndex(
        (_object) => _object.name === object.name
      );
      if (foundObjectIndex !== -1) {
        const copy = [...data.pages];
        const pageCopy = [...data.pages[i].data];

        pageCopy[foundObjectIndex] = object;

        copy[i].data = pageCopy;

        updateStore(copy);

        return;
      }
    }

    const copy = [...data.pages];
    const dataCopy = [...copy[copy.length - 1].data];

    dataCopy.push(object);
    copy[copy.length - 1].data = dataCopy;

    updateStore(copy);
  };

  const addOneFolder = (objectName: string) => {
    if (!data) {
      return;
    }

    const folder: ObjectStorageObject = {
      etag: null,
      last_modified: null,
      name: `${prefix + objectName}/`,
      owner: null,
      size: null,
    };

    for (const page of data.pages) {
      if (page.data.find((object) => object.name === folder.name)) {
        // If a folder already exists in the store, invalidate that store for that specific
        // prefix. Due to how invalidateQueries works, all subdirectories also get invalidated.
        queryClient.invalidateQueries([
          queryKey,
          clusterId,
          bucketName,
          ...`${prefix}${objectName}`.split('/'),
        ]);
        return;
      }
    }

    const copy = [...data.pages];
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
      <BucketBreadcrumb
        bucketName={bucketName}
        history={history}
        prefix={prefix}
      />
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
        title={
          objectToDelete
            ? `Delete ${truncateMiddle(displayName(objectToDelete))}`
            : 'Delete object'
        }
        error={deleteObjectError}
        onClose={closeDeleteObjectDialog}
        open={deleteObjectDialogOpen}
      >
        Are you sure you want to delete this object?
      </ConfirmationDialog>
      <ObjectDetailsDrawer
        url={
          selectedObject
            ? generateObjectUrl(clusterId, bucketName, selectedObject.name)
                .absolute
            : undefined
        }
        bucketName={bucketName}
        clusterId={clusterId}
        displayName={selectedObject?.name}
        lastModified={selectedObject?.last_modified}
        name={selectedObject?.name}
        onClose={closeObjectDetailsDrawer}
        open={objectDetailDrawerOpen}
        size={selectedObject?.size}
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
