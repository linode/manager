import { Database } from '@linode/api-v4/lib/databases/types';
import { groupBy, prop } from 'ramda';
import * as React from 'react';
import Chip from 'src/components/core/Chip';
import { makeStyles, Theme } from 'src/components/core/styles';
import DeletionDialog from 'src/components/DeletionDialog';
import EntityTable from 'src/components/EntityTable/EntityTable_CMR';
import ErrorState from 'src/components/ErrorState';
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
    marginRight: theme.spacing(3),
    paddingTop: '0px !important',
    paddingBottom: '0px !important'
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
  // @todo Pending API work
  // {
  //   label: 'Region',
  //   dataColumn: 'region',
  //   sortable: true,
  //   widthPercent: 10
  // },
  // {
  //   label: 'Hostname',
  //   dataColumn: 'hostname',
  //   sortable: true,
  //   widthPercent: 15,
  //   hideOnMobile: true
  // },
  // {
  //   label: 'Port',
  //   dataColumn: 'port',
  //   sortable: true,
  //   widthPercent: 5,
  //   hideOnMobile: true
  // },
  // {
  //   label: 'Last Backup',
  //   dataColumn: 'backup',
  //   sortable: true,
  //   widthPercent: 10,
  //   hideOnMobile: true
  // },
  {
    label: 'Tags',
    dataColumn: 'tags',
    sortable: false,
    widthPercent: 30,
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

const DatabaseLanding: React.FC<{}> = _ => {
  const classes = useStyles();
  const { databases, deleteDatabase, updateDatabase } = useDatabases();
  const { dialog, closeDialog, openDialog, submitDialog } = useDialog(
    deleteDatabase
  );

  const databaseData = Object.values(databases.itemsById ?? {});

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

  const handlers: CombinedHandlers = {
    triggerDeleteDatabase: openDialog,
    openTagDrawer
  };

  const _DatabaseRow = {
    Component: DatabaseRow,
    handlers,
    data: databaseData,
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

  const { ready, error, initializing, unknown } = counts;
  const chips = (
    <>
      {ready.length !== 0 && (
        <Chip
          className={`${classes.chip} ${classes.chipRunning}`}
          label={`${ready.length} READY`}
        />
      )}
      {unknown.length !== 0 && (
        <Chip
          className={`${classes.chip} ${classes.chipOffline}`}
          label={`${unknown.length} UNKNOWN`}
        />
      )}
      {error.length !== 0 && (
        <Chip
          className={`${classes.chip} ${classes.chipError}`}
          label={`${error.length} ERROR`}
        />
      )}
      {initializing.length !== 0 && (
        <Chip
          className={`${classes.chip} ${classes.chipPending}`}
          label={`${initializing.length} INITIALIZING`}
        />
      )}
    </>
  );

  return (
    <React.Fragment>
      <LandingHeader
        title="Databases"
        entity="Database"
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
        typeToConfirm
        label={dialog.entityLabel ?? ''}
        entity="database"
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
