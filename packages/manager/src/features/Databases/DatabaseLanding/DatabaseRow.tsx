import { DatabaseStatus } from '@linode/api-v4/lib/databases/types';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Hidden from 'src/components/core/Hidden';
import StatusIcon from 'src/components/StatusIcon';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import TagCell from 'src/components/TagCell';
import useDatabases from 'src/hooks/useDatabases';
import { capitalize } from 'src/utilities/capitalize';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import ActionMenu, { ActionHandlers } from './DatabaseActionMenu';

interface Props extends ActionHandlers {
  id: number;
  label: string;
  status: DatabaseStatus;
  region?: string; // @todo should be required when the API adds it
  tags?: string[];
}

const getDisplayStatus = (status: DatabaseStatus) => {
  switch (status) {
    case 'ready':
      return 'active';
    case 'error':
      return 'error';
    case 'unknown':
      return 'inactive';
    case 'initializing':
      return 'other';
  }
};

export const DatabaseRow: React.FC<Props> = (props) => {
  const { id, label, status, tags, openTagDrawer, ...actionHandlers } = props;
  const _tags = tags ?? [];

  const { enqueueSnackbar } = useSnackbar();
  const { updateDatabase } = useDatabases();

  const displayStatus = getDisplayStatus(status);

  const addTag = React.useCallback(
    (tag: string) => {
      const newTags = [..._tags, tag];
      updateDatabase(id, { tags: newTags }).catch((e) =>
        enqueueSnackbar(getAPIErrorOrDefault(e, 'Error adding tag')[0].reason, {
          variant: 'error',
        })
      );
    },
    [_tags, id, updateDatabase, enqueueSnackbar]
  );

  const deleteTag = React.useCallback(
    (tag: string) => {
      const newTags = _tags.filter((thisTag) => thisTag !== tag);
      updateDatabase(id, { tags: newTags }).catch((e) =>
        enqueueSnackbar(
          getAPIErrorOrDefault(e, 'Error deleting tag')[0].reason,
          {
            variant: 'error',
          }
        )
      );
    },
    [_tags, id, updateDatabase, enqueueSnackbar]
  );
  return (
    <TableRow
      key={`database-row-${id}`}
      data-testid={`database-row-${id}`}
      ariaLabel={`Database ${label}`}
    >
      <TableCell>
        <Link to={`/databases/${id}`}>{label}</Link>
      </TableCell>
      <TableCell>
        <StatusIcon status={displayStatus} />
        {capitalize(status)}
      </TableCell>
      <Hidden xsDown>
        {/** Pending API work */}
        {/* <TableCell>Hostname</TableCell>
        <TableCell>Port</TableCell>
        <TableCell>Last Backup</TableCell> */}
        <TagCell
          tags={_tags}
          width={250}
          addTag={addTag}
          deleteTag={deleteTag}
          listAllTags={() => openTagDrawer(id, label, _tags)}
          inTableContext
        />
      </Hidden>

      <TableCell>
        <ActionMenu databaseID={id} databaseLabel={label} {...actionHandlers} />
      </TableCell>
    </TableRow>
  );
};

export default React.memo(DatabaseRow);
