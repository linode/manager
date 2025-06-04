import { BetaChip, CircleProgress, ErrorState, Notice } from '@linode/ui';
import { useEditableLabelState } from '@linode/utilities';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import DatabaseLogo from 'src/features/Databases/DatabaseLanding/DatabaseLogo';
import { useFlags } from 'src/hooks/useFlags';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { useTabs } from 'src/hooks/useTabs';
import {
  useDatabaseMutation,
  useDatabaseQuery,
  useDatabaseTypesQuery,
} from 'src/queries/databases/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { DatabaseAdvancedConfiguration } from './DatabaseAdvancedConfiguration/DatabaseAdvancedConfiguration';

import type { APIError } from '@linode/api-v4/lib/types';

const DatabaseSummary = React.lazy(() =>
  import('./DatabaseSummary/DatabaseSummary').then((module) => ({
    default: module.DatabaseSummary,
  }))
);
const DatabaseBackups = React.lazy(() =>
  import('./DatabaseBackups/DatabaseBackups').then((module) => ({
    default: module.DatabaseBackups,
  }))
);
const DatabaseSettings = React.lazy(() => import('./DatabaseSettings'));
const DatabaseResize = React.lazy(() =>
  import('./DatabaseResize/DatabaseResize').then((module) => ({
    default: module.DatabaseResize,
  }))
);
const DatabaseMonitor = React.lazy(() =>
  import('./DatabaseMonitor/DatabaseMonitor').then((module) => ({
    default: module.DatabaseMonitor,
  }))
);

const DatabaseAlert = React.lazy(() =>
  import('../../CloudPulse/Alerts/ContextualView/AlertReusableComponent').then(
    ({ AlertReusableComponent }) => ({
      default: AlertReusableComponent,
    })
  )
);
export const DatabaseDetail = () => {
  const flags = useFlags();

  const { databaseId, engine } = useParams({
    from: '/databases/$engine/$databaseId',
  });

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

  const { editableLabelError, resetEditableLabel, setEditableLabelError } =
    useEditableLabelState();

  const isDefault = database?.platform === 'rdbms-default';
  const isMonitorEnabled = isDefault && flags.dbaasV2MonitorMetrics?.enabled;
  const isAdvancedConfigEnabled = isDefault && flags.databaseAdvancedConfig;

  const { tabs, tabIndex, handleTabChange, getTabIndex } = useTabs([
    {
      to: `/databases/$engine/$databaseId/summary`,
      title: 'Summary',
    },
    {
      to: `/databases/$engine/$databaseId/metrics`,
      title: 'Metrics',
      hide: !isMonitorEnabled,
      chip: flags.dbaasV2MonitorMetrics?.beta ? <BetaChip /> : null,
    },
    {
      to: `/databases/$engine/$databaseId/backups`,
      title: 'Backups',
    },
    {
      to: `/databases/$engine/$databaseId/resize`,
      title: 'Resize',
      hide: !flags.databaseResize,
    },
    {
      to: `/databases/$engine/$databaseId/settings`,
      title: 'Settings',
    },

    {
      to: `/databases/$engine/$databaseId/configs`,
      title: 'Advanced Configuration',
      hide: !isAdvancedConfigEnabled,
    },
  ]);

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
      <DocumentTitleSegment
        segment={`${database?.label} - ${
          tabs[tabIndex]?.title ?? 'Detail View'
        }`}
      />
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
        spacingBottom={4}
        title={database.label}
      />
      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        {isDatabasesGrantReadOnly && (
          <Notice
            text={
              "You don't have permissions to modify this Database. Please contact an account administrator for details."
            }
            variant="warning"
          />
        )}

        <TabPanels>
          <SafeTabPanel
            index={getTabIndex('/databases/$engine/$databaseId/summary')}
          >
            <DatabaseSummary
              database={database}
              disabled={isDatabasesGrantReadOnly}
            />
          </SafeTabPanel>
          {isMonitorEnabled ? (
            <SafeTabPanel
              index={getTabIndex('/databases/$engine/$databaseId/metrics')}
            >
              <DatabaseMonitor database={database} />
            </SafeTabPanel>
          ) : null}
          <SafeTabPanel
            index={getTabIndex('/databases/$engine/$databaseId/backups')}
          >
            <DatabaseBackups disabled={isDatabasesGrantReadOnly} />
          </SafeTabPanel>
          {flags.databaseResize ? (
            <SafeTabPanel
              index={getTabIndex('/databases/$engine/$databaseId/resize')}
            >
              <DatabaseResize
                database={database}
                disabled={isDatabasesGrantReadOnly}
              />
            </SafeTabPanel>
          ) : null}
          <SafeTabPanel
            index={getTabIndex('/databases/$engine/$databaseId/settings')}
          >
            <DatabaseSettings
              database={database}
              disabled={isDatabasesGrantReadOnly}
            />
          </SafeTabPanel>
          {isAdvancedConfigEnabled && (
            <SafeTabPanel
              index={getTabIndex('/databases/$engine/$databaseId/configs')}
            >
              <DatabaseAdvancedConfiguration database={database} />
            </SafeTabPanel>
          )}
          <SafeTabPanel index={6}>
            <DatabaseAlert
              entityId={String(database.id)}
              entityName={database.label}
              serviceType="dbaas"
            />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
      {isDefault && <DatabaseLogo />}
    </>
  );
};
