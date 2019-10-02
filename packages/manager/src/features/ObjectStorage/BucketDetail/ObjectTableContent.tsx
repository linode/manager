import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { useWindowDimensions } from 'src/hooks/useWindowDimensions';
import { truncateEnd, truncateMiddle } from 'src/utilities/truncate';
import { ExtendedObject } from '../utilities';
import FolderTableRow from './FolderTableRow';
import ObjectTableRow from './ObjectTableRow';

interface Props {
  data: ExtendedObject[];
  loading: boolean;
  error?: APIError[];
  prefix: string;
  handleClickDelete: (objectName: string) => void;
}

const ObjectTableContent: React.FC<Props> = props => {
  const { data, loading, error, prefix, handleClickDelete } = props;

  const { width } = useWindowDimensions();

  if (loading && data.length === 0) {
    return <TableRowLoading colSpan={6} />;
  }

  if (error) {
    return (
      <TableRowError
        colSpan={6}
        message="We were unable to load your Objects."
      />
    );
  }

  // If there is no prefix, this is NOT a folder, so display the empty bucket message.
  if (data.length === 0 && !prefix) {
    return (
      <TableRowEmptyState
        colSpan={6}
        message="This bucket is empty."
        // @todo: When we have the ability to add objects, use this message:
        // message="This bucket is empty. Click here to add Objects."
      />
    );
  }

  // A folder is considered "empty" if `_shouldDisplayObject` is `false` for
  // every object in the folder.
  const isFolderEmpty = data.every(object => !object._shouldDisplayObject);

  if (isFolderEmpty) {
    return (
      <TableRowEmptyState colSpan={6} message="This folder is empty." />
      // @todo: When we have the ability to add objects, use this message:
      // <TableRowEmptyState colSpan={6} message="This folder is empty. Click here to add Objects." />
    );
  }

  // Be more strict with truncation lengths on smaller viewports.
  const maxNameWidth = width < 600 ? 20 : 40;

  return (
    <>
      {data.map(object => {
        if (!object._shouldDisplayObject) {
          return null;
        }

        if (object._isFolder) {
          return (
            <FolderTableRow
              key={object.name}
              folderName={object.name}
              displayName={truncateEnd(object._displayName, maxNameWidth)}
            />
          );
        }

        return (
          <ObjectTableRow
            key={object.name}
            objectName={truncateMiddle(object._displayName, maxNameWidth)}
            /**
             * In reality, if there's no `size` or `last_modified`, we're
             * probably dealing with a folder and will have already returned
             * `null`. The OR fallbacks are to make TSC happy, and to safeguard
             * in the event of the data being something we don't expect.
             */
            objectSize={object.size || 0}
            objectLastModified={object.last_modified || ''}
            handleClickDelete={() => handleClickDelete(object.name)}
          />
        );
      })}
      {loading && <TableRowLoading colSpan={12} transparent />}
    </>
  );
};

export default React.memo(ObjectTableContent);
