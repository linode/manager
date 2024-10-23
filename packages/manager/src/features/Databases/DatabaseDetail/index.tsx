import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import { matchPath, useHistory, useParams } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { Notice } from 'src/components/Notice/Notice';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab, TabLinkList } from 'src/components/Tabs/TabLinkList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import DatabaseLogo from 'src/features/Databases/DatabaseLanding/DatabaseLogo';
import { useEditableLabelState } from 'src/hooks/useEditableLabelState';
import { useFlags } from 'src/hooks/useFlags';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import {
  useDatabaseMutation,
  useDatabaseQuery,
  useDatabaseTypesQuery,
} from 'src/queries/databases/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { Engine } from '@linode/api-v4/lib/databases/types';
import type { APIError } from '@linode/api-v4/lib/types';
import { BetaChip } from 'src/components/BetaChip/BetaChip';
import { useIsDatabasesEnabled } from '../utilities';

const DatabaseSummary = React.lazy(() => import('./DatabaseSummary'));
const DatabaseBackups = React.lazy(
  () => import('./DatabaseBackups/DatabaseBackups')
);
const DatabaseSettings = React.lazy(() => import('./DatabaseSettings'));
const DatabaseResize = React.lazy(() =>
  import('./DatabaseResize/DatabaseResize').then(({ DatabaseResize }) => ({
    default: DatabaseResize,
  }))
);
const DatabaseMonitor = React.lazy(() =>
  import('./DatabaseMonitor/DatabaseMonitor').then(({ DatabaseMonitor }) => ({
    default: DatabaseMonitor,
  }))
);
export const DatabaseDetail = () => {
  const history = useHistory();
  const flags = useFlags();

  const { databaseId, engine } = useParams<{
    databaseId: string;
    engine: Engine;
  }>();

  const id = Number(databaseId);

  const { data: database, error, isLoading } = useDatabaseQuery(engine, id);
  const { isLoading: isTypesLoading } = useDatabaseTypesQuery({
    platform: database?.platform,
  });

  const { mutateAsync: updateDatabase } = useDatabaseMutation(engine, id);

  const isDatabasesGrantReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'database',
    id,
  });

  const {
    editableLabelError,
    resetEditableLabel,
    setEditableLabelError,
  } = useEditableLabelState();

  const {
    isDatabasesMonitorEnabled,
    isDatabasesMonitorBeta,
  } = useIsDatabasesEnabled();

  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(error, 'Error loading your database.')[0].reason
        }
      />
    );
  }

  if (isLoading || isTypesLoading) {
    return <CircleProgress />;
  }

  if (!database) {
    return null;
  }

  const isDefault = database.platform === 'rdbms-default';
  const isMonitorEnabled = isDefault && isDatabasesMonitorEnabled;

  const tabs: Tab[] = [
    {
      routeName: `/databases/${engine}/${id}/summary`,
      title: 'Summary',
    },
    {
      routeName: `/databases/${engine}/${id}/backups`,
      title: 'Backups',
    },
    {
      routeName: `/databases/${engine}/${id}/settings`,
      title: 'Settings',
    },
  ];

  const resizeIndex = isMonitorEnabled ? 3 : 2;
  const backupsIndex = isMonitorEnabled ? 2 : 1;

  if (isMonitorEnabled) {
    tabs.splice(1, 0, {
      routeName: `/databases/${engine}/${id}/monitor`,
      title: 'Monitor',
      chip: isDatabasesMonitorBeta ? <BetaChip /> : null,
    });
  }

  if (flags.databaseResize) {
    tabs.splice(resizeIndex, 0, {
      routeName: `/databases/${engine}/${id}/resize`,
      title: 'Resize',
    });
  }

  const getTabIndex = () => {
    const tabChoice = tabs.findIndex((tab) =>
      Boolean(matchPath(tab.routeName, { path: location.pathname }))
    );

    // Redirect to the landing page if the path does not exist
    if (tabChoice < 0) {
      history.push(`/databases/${engine}/${id}`);

      return 0;
    }

    return tabChoice;
  };

  const handleTabChange = (index: number) => {
    history.push(tabs[index].routeName);
  };

  const handleSubmitLabelChange = (newLabel: string) => {
    // @TODO Update this to only send the label when the API supports it
    return updateDatabase({ allow_list: database.allow_list, label: newLabel })
      .then(() => {
        resetEditableLabel();
      })
      .catch((err) => {
        const errors: APIError[] = getAPIErrorOrDefault(
          err,
          'An error occurred while updating label',
          'label'
        );

        const errorStrings: string[] = errors.map((e) => e.reason);
        setEditableLabelError(errorStrings[0]);
        return Promise.reject(errorStrings[0]);
      });
  };

  return (
    <>
      <DocumentTitleSegment segment={database.label} />
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'Database Clusters',
              position: 1,
            },
          ],
          firstAndLastOnly: true,
          labelOptions: { noCap: true },
          onEditHandlers: {
            editableTextTitle: database.label,
            errorText: editableLabelError,
            onCancel: resetEditableLabel,
            onEdit: handleSubmitLabelChange,
          },
          pathname: location.pathname,
        }}
        disabledBreadcrumbEditButton={isDatabasesGrantReadOnly}
        title={database.label}
      />
      <Tabs index={getTabIndex()} onChange={handleTabChange}>
        <TabLinkList tabs={tabs} />
        {isDatabasesGrantReadOnly && (
          <Notice
            text={
              "You don't have permissions to modify this Database. Please contact an account administrator for details."
            }
            important
            variant="warning"
          />
        )}

        <TabPanels>
          <SafeTabPanel index={0}>
            <DatabaseSummary
              database={database}
              disabled={isDatabasesGrantReadOnly}
            />
          </SafeTabPanel>
          {isMonitorEnabled ? (
            <SafeTabPanel index={1}>
              <DatabaseMonitor database={database} />
            </SafeTabPanel>
          ) : null}
          <SafeTabPanel index={backupsIndex}>
            <DatabaseBackups disabled={isDatabasesGrantReadOnly} />
          </SafeTabPanel>
          {flags.databaseResize ? (
            <SafeTabPanel index={resizeIndex}>
              <DatabaseResize
                database={database}
                disabled={isDatabasesGrantReadOnly}
              />
            </SafeTabPanel>
          ) : null}
          <SafeTabPanel index={tabs.length - 1}>
            <DatabaseSettings
              database={database}
              disabled={isDatabasesGrantReadOnly}
            />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
      {isDefault && <DatabaseLogo />}
    </>
  );
};

export const databaseDetailLazyRoute = createLazyRoute(
  '/databases/$engine/$databaseId'
)({
  component: DatabaseDetail,
});

export default DatabaseDetail;
