import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import Box from 'src/components/core/Box';
import { Hidden } from 'src/components/Hidden';
import { Button } from 'src/components/Button/Button';
import ObjectTableContent from './ObjectTableContent';
import produce from 'immer';
import { BucketBreadcrumb } from './BucketBreadcrumb';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { CreateFolderDrawer } from './CreateFolderDrawer';
import { debounce } from 'throttle-debounce';
import { deleteObject as _deleteObject } from '../requests';
import { getQueryParamFromQueryString } from 'src/utilities/queryParams';
import { OBJECT_STORAGE_DELIMITER } from 'src/constants';
import { ObjectDetailsDrawer } from './ObjectDetailsDrawer';
import { ObjectUploader } from '../ObjectUploader/ObjectUploader';
import { sendDownloadObjectEvent } from 'src/utilities/analytics';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { truncateMiddle } from 'src/utilities/truncate';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { Waypoint } from 'react-waypoint';
import {
  displayName,
  generateObjectUrl,
  isEmptyObjectForFolder,
  tableUpdateAction,
} from '../utilities';
import {
  getObjectList,
  getObjectURL,
  ObjectStorageClusterID,
  ObjectStorageObject,
  ObjectStorageObjectListResponse,
} from '@linode/api-v4/lib/object-storage';
import {
  prefixToQueryKey,
  queryKey,
  updateBucket,
  useObjectBucketDetailsInfiniteQuery,
} from 'src/queries/objectStorage';
import {
  StyledCreateFolderButton,
  StyledFooter,
  StyledNameColumn,
  StyledSizeColumn,
  StyledTryAgainButton,
} from './BucketDetail.styles';

interface MatchParams {
  clusterId: ObjectStorageClusterID;
  bucketName: string;
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
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
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
        prefix: objectToDelete,
        delimiter: OBJECT_STORAGE_DELIMITER,
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
      pages: ObjectStorageObjectListResponse[];
      pageParams: string[];
    }>(
      [queryKey, clusterId, bucketName, 'objects', ...prefixToQueryKey(prefix)],
      (data) => ({
        pages,
        pageParams: data?.pageParams || [],
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
      name: prefix + objectName,
      etag: '',
      owner: '',
      last_modified: new Date().toISOString(),
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
      name: `${prefix + objectName}/`,
      etag: null,
      owner: null,
      last_modified: null,
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
        prefix={prefix}
        history={history}
        bucketName={bucketName}
      />
      <ObjectUploader
        clusterId={clusterId}
        bucketName={bucketName}
        prefix={prefix}
        maybeAddObjectToTable={maybeAddObjectToTable}
      />
      <Box display="flex" justifyContent="flex-end" mt={1.5} mb={0.5}>
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
            isFetching={isFetching}
            isFetchingNextPage={isFetchingNextPage}
            error={error ? error : undefined}
            handleClickDownload={handleDownload}
            handleClickDelete={handleClickDelete}
            handleClickDetails={handleClickDetails}
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
        <StyledFooter variant="subtitle2">
          The next objects in the list failed to load.{' '}
          <StyledTryAgainButton onClick={() => fetchNextPage()}>
            Click here to try again.
          </StyledTryAgainButton>
        </StyledFooter>
      )}

      {!hasNextPage && numOfDisplayedObjects >= 100 && (
        <StyledFooter variant="subtitle2">
          Showing all {numOfDisplayedObjects} items
        </StyledFooter>
      )}
      <ConfirmationDialog
        open={deleteObjectDialogOpen}
        onClose={closeDeleteObjectDialog}
        title={
          objectToDelete
            ? `Delete ${truncateMiddle(displayName(objectToDelete))}`
            : 'Delete object'
        }
        actions={() => (
          <ActionsPanel>
            <Button
              buttonType="secondary"
              onClick={closeDeleteObjectDialog}
              data-qa-cancel
            >
              Cancel
            </Button>
            <Button
              buttonType="primary"
              onClick={deleteObject}
              loading={deleteObjectLoading}
              data-qa-submit-rebuild
            >
              Delete
            </Button>
          </ActionsPanel>
        )}
        error={deleteObjectError}
      >
        Are you sure you want to delete this object?
      </ConfirmationDialog>
      <ObjectDetailsDrawer
        open={objectDetailDrawerOpen}
        onClose={closeObjectDetailsDrawer}
        bucketName={bucketName}
        clusterId={clusterId}
        displayName={selectedObject?.name}
        name={selectedObject?.name}
        lastModified={selectedObject?.last_modified}
        size={selectedObject?.size}
        url={
          selectedObject
            ? generateObjectUrl(clusterId, bucketName, selectedObject.name)
                .absolute
            : undefined
        }
      />
      <CreateFolderDrawer
        bucketName={bucketName}
        clusterId={clusterId}
        prefix={prefix}
        open={isCreateFolderDrawerOpen}
        onClose={() => setIsCreateFolderDrawerOpen(false)}
        maybeAddObjectToTable={maybeAddObjectToTable}
      />
    </>
  );
};
