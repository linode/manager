import { Database, DatabaseStatus } from '@linode/api-v4/lib/databases/types';
import Close from '@material-ui/icons/Close';
import * as classNames from 'classnames';
import { groupBy, prop } from 'ramda';
import * as React from 'react';
import Chip from 'src/components/core/Chip';
import { makeStyles, Theme } from 'src/components/core/styles';
import DeletionDialog from 'src/components/DeletionDialog';
import EntityTable from 'src/components/EntityTable/EntityTable_CMR';
import ErrorState from 'src/components/ErrorState';
import IconTextLink from 'src/components/IconTextLink';
import LandingHeader from 'src/components/LandingHeader';
import TagDrawer, {
  OpenTagDrawer,
  TagDrawerProps
} from 'src/components/TagCell/TagDrawer';
import useDatabases from 'src/hooks/useDatabases';
import { useDialog } from 'src/hooks/useDialog';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { ActionHandlers as DatabaseHandlers } from './DatabaseActionMenu';
import DatabaseRow from './DatabaseRow';

const useStyles = makeStyles((theme: Theme) => ({
  chip: {
    ...theme.applyStatusPillStyles,
    paddingTop: '0px !important',
    paddingBottom: '0px !important',
    '&:hover, &:focus, &:active': {
      backgroundColor: theme.bg.chipActive
    }
  },
  chipActive: {
    backgroundColor: theme.bg.chipActive
  },
  chipRunning: {
    '&:before': {
      backgroundColor: theme.cmrIconColors.iGreen
    }
  },
  chipError: {
    '&:before': {
      backgroundColor: theme.cmrIconColors.iRed
    }
  },
  chipOffline: {
    '&:before': {
      backgroundColor: theme.cmrIconColors.iGrey
    }
  },
  chipPending: {
    '&:before': {
      backgroundColor: theme.cmrIconColors.iOrange
    }
  },
  clearFilters: {
    margin: '1px 0 0 0',
    padding: 0,
    '&:hover': {
      '& svg': {
        color: `${theme.palette.primary.main} !important`
      }
    }
  }
}));

const headers = [
  {
    label: 'Label',
    dataColumn: 'label',
    sortable: true,
    widthPercent: 15
  },
  {
    label: 'Status',
    dataColumn: 'status',
    sortable: true,
    widthPercent: 10
  },
  {
    label: 'Region',
    dataColumn: 'region',
    sortable: true,
    widthPercent: 10
  },
  {
    label: 'Hostname',
    dataColumn: 'hostname',
    sortable: true,
    widthPercent: 15,
    hideOnMobile: true
  },
  {
    label: 'Port',
    dataColumn: 'port',
    sortable: true,
    widthPercent: 5,
    hideOnMobile: true
  },
  {
    label: 'Last Backup',
    dataColumn: 'backup',
    sortable: true,
    widthPercent: 10,
    hideOnMobile: true
  },
  {
    label: 'Tags',
    dataColumn: 'tags',
    sortable: false,
    widthPercent: 15,
    hideOnMobile: true
  },
  {
    label: 'Action Menu',
    visuallyHidden: true,
    dataColumn: '',
    sortable: false,
    widthPercent: 5
  }
];

interface CombinedHandlers extends DatabaseHandlers {
  openTagDrawer: OpenTagDrawer;
}

type FilterStatus = DatabaseStatus | 'all';

const DatabaseLanding: React.FC<{}> = _ => {
  const classes = useStyles();
  const { databases, deleteDatabase, updateDatabase } = useDatabases();
  const { dialog, closeDialog, openDialog, submitDialog } = useDialog(
    deleteDatabase
  );

  const databaseData = Object.values(databases.itemsById ?? {});

  const [filterStatus, setFilterStatus] = React.useState<FilterStatus>('all');

  const [tagDrawer, setTagDrawer] = React.useState<TagDrawerProps>({
    open: false,
    tags: [],
    label: '',
    entityID: 0
  });

  const openTagDrawer: OpenTagDrawer = (
    id: number,
    label: string,
    tags: string[]
  ) =>
    setTagDrawer({
      open: true,
      tags,
      label,
      entityID: id
    });

  const closeTagDrawer = () => {
    setTagDrawer({ ...tagDrawer, open: false });
  };

  const addTag = (databaseID: number, newTag: string) => {
    const _tags = [...tagDrawer.tags, newTag];
    return updateDatabase(databaseID, { tags: _tags }).then(_ => {
      setTagDrawer({ ...tagDrawer, tags: _tags });
    });
  };

  const deleteTag = (databaseID: number, tagToDelete: string) => {
    const _tags = tagDrawer.tags.filter(thisTag => thisTag !== tagToDelete);
    return updateDatabase(databaseID, { tags: _tags }).then(_ => {
      setTagDrawer({ ...tagDrawer, tags: _tags });
    });
  };

  const counts = getChipCounts(databaseData);
  const filteredData =
    filterStatus === 'all' ? databaseData : counts[filterStatus];

  const handlers: CombinedHandlers = {
    triggerDeleteDatabase: openDialog,
    openTagDrawer
  };

  const _DatabaseRow = {
    Component: DatabaseRow,
    handlers,
    data: filteredData,
    loading: databases.loading,
    lastUpdated: databases.lastUpdated,
    error: databases.error.read
  };

  if (databases.error.read) {
    const message = getAPIErrorOrDefault(
      databases.error.read,
      'Error loading your databases.'
    )[0].reason;
    return <ErrorState errorText={message} />;
  }

  const chipProps = {
    component: 'button',
    clickable: true
  };

  const { ready, error, initializing, unknown } = counts;
  const chips = (
    <>
      {ready.length !== 0 && (
        <Chip
          className={classNames({
            [classes.chip]: true,
            [classes.chipRunning]: true,
            [classes.chipActive]: filterStatus === 'ready'
          })}
          label={`${ready.length} READY`}
          onClick={() => setFilterStatus('ready')}
          {...chipProps}
        />
      )}
      {unknown.length !== 0 && (
        <Chip
          className={classNames({
            [classes.chip]: true,
            [classes.chipOffline]: true,
            [classes.chipActive]: filterStatus === 'unknown'
          })}
          onClick={() => setFilterStatus('unknown')}
          label={`${unknown.length} UNKNOWN`}
          {...chipProps}
        />
      )}
      {error.length !== 0 && (
        <Chip
          className={classNames({
            [classes.chip]: true,
            [classes.chipError]: true,
            [classes.chipActive]: filterStatus === 'error'
          })}
          onClick={() => setFilterStatus('error')}
          label={`${error.length} ERROR`}
          {...chipProps}
        />
      )}
      {initializing.length !== 0 && (
        <Chip
          className={classNames({
            [classes.chip]: true,
            [classes.chipPending]: true,
            [classes.chipActive]: filterStatus === 'initializing'
          })}
          onClick={() => setFilterStatus('initializing')}
          label={`${initializing.length} INITIALIZING`}
          {...chipProps}
        />
      )}
      {filterStatus !== 'all' && (
        <IconTextLink
          SideIcon={Close}
          text="CLEAR FILTERS"
          title="CLEAR FILTERS"
          className={`${classes.clearFilters}`}
          onClick={() => setFilterStatus('all')}
        />
      )}
    </>
  );

  return (
    <React.Fragment>
      <LandingHeader
        title="Databases"
        entity="Database"
        iconType="linode"
        docsLink="http://google.com"
        body={chips}
      />
      <EntityTable
        entity="databases"
        groupByTag={false}
        row={_DatabaseRow}
        headers={headers}
        initialOrder={{ order: 'asc', orderBy: 'label' }}
      />
      <DeletionDialog
        label={dialog.entityLabel ?? ''}
        error={dialog.error}
        open={dialog.isOpen}
        loading={dialog.isLoading}
        onClose={closeDialog}
        onDelete={() => submitDialog(dialog.entityID)}
      />
      <TagDrawer
        entityLabel={tagDrawer.label}
        open={tagDrawer.open}
        tags={tagDrawer.tags}
        addTag={(newTag: string) => addTag(tagDrawer.entityID, newTag)}
        deleteTag={(tag: string) => deleteTag(tagDrawer.entityID, tag)}
        onClose={closeTagDrawer}
      />
    </React.Fragment>
  );
};

interface ChipCounts {
  ready: Database[];
  error: Database[];
  unknown: Database[];
  initializing: Database[];
}

export const getChipCounts = (databases: Database[]): ChipCounts => {
  const groups = groupBy(prop('status'), databases);
  return {
    ready: groups.ready ?? [],
    error: groups.error ?? [],
    unknown: groups.unknown ?? [],
    initializing: groups.initializing ?? []
  };
};

export default React.memo(DatabaseLanding);
