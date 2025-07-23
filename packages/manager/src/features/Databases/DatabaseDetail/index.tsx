import {
  useDatabaseMutation,
  useDatabaseQuery,
  useDatabaseTypesQuery,
} from '@linode/queries';
import {
  BetaChip,
  CircleProgress,
  ErrorState,
  NewFeatureChip,
  Notice,
  Typography,
} from '@linode/ui';
import { useEditableLabelState } from '@linode/utilities';
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import * as React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { DatabaseDetailContext } from 'src/features/Databases/DatabaseDetail/DatabaseDetailContext';
import DatabaseLogo from 'src/features/Databases/DatabaseLanding/DatabaseLogo';
import { useFlags } from 'src/hooks/useFlags';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { useTabs } from 'src/hooks/useTabs';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { APIError } from '@linode/api-v4/lib/types';

export const DatabaseDetail = () => {
  const flags = useFlags();
  const navigate = useNavigate();
  const location = useLocation();

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
  const isVPCEnabled = isDefault && flags.databaseVpc;
  const isAdvancedConfigEnabled = isDefault && flags.databaseAdvancedConfig;

  const settingsTabPath = `/databases/$engine/$databaseId/settings`;

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
      to: `/databases/$engine/$databaseId/networking`,
      title: 'Networking',
      hide: !isVPCEnabled,
      chip: <NewFeatureChip />,
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
      to: settingsTabPath,
      title: 'Settings',
    },
    {
      to: `/databases/$engine/$databaseId/configs`,
      title: 'Advanced Configuration',
      hide: !isAdvancedConfigEnabled,
    },
    {
      to: `/databases/$engine/$databaseId/alerts`,
      title: 'Alerts',
      hide: false,
      chip: flags.dbaasV2MonitorMetrics?.beta ? <BetaChip /> : null,
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

  if (location.pathname === `/databases/${engine}/${databaseId}`) {
    navigate({
      to: `/databases/$engine/$databaseId/summary`,
      params: {
        engine,
        databaseId,
      },
    });
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

  const onSettingsTab = tabIndex === getTabIndex(settingsTabPath);

  return (
    <DatabaseDetailContext.Provider
      value={{
        database,
        disabled: isDatabasesGrantReadOnly,
        engine,
        isMonitorEnabled,
        isVPCEnabled,
        isResizeEnabled: flags.databaseResize,
        isAdvancedConfigEnabled,
      }}
    >
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
        {isVPCEnabled && onSettingsTab && (
          <DismissibleBanner
            preferenceKey="database-manage-access-moved-notice"
            variant="info"
          >
            <Typography>
              The Manage Access settings were moved and are now available in the
              Networking tab.
            </Typography>
          </DismissibleBanner>
        )}

        <TabPanels>
          <Outlet />
        </TabPanels>
      </Tabs>
      {isDefault && <DatabaseLogo />}
    </DatabaseDetailContext.Provider>
  );
};
