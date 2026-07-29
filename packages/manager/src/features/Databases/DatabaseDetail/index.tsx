import { NotificationBanner, Tab, Tabs } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { getAPIErrorOrDefault } from '@akamai/compute-ui-core/api';
import {
  useDatabaseMutation,
  useDatabaseQuery,
  useDatabaseTypesQuery,
} from '@linode/queries';
import { useEditableLabelState } from '@linode/utilities';
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { DatabaseDetailContext } from 'src/features/Databases/DatabaseDetail/DatabaseDetailContext';
import DatabaseLogo from 'src/features/Databases/DatabaseLanding/DatabaseLogo';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';

import { CircleProgress } from '../shared/CircleProgress/CircleProgress';
import { ErrorState } from '../shared/ErrorState/ErrorState';
import { useTabs } from '../shared/hooks/useTabs';

import type { Tab as TabInterface } from '../shared/hooks/useTabs';
import type { TabsElement } from '@akamai/cds-components/react';
import type { APIError } from '@linode/api-v4/lib/types';

export const DatabaseDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tabsRef = React.useRef<TabsElement>(null);

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

  const settingsTabPath = `/databases/$engine/$databaseId/settings`;

  const { tabs, tabIndex, handleTabChange } = useTabs(
    [
      {
        to: `/databases/$engine/$databaseId/summary`,
        title: 'Summary',
      },
      {
        to: `/databases/$engine/$databaseId/metrics`,
        title: 'Metrics',
      },
      {
        to: `/databases/$engine/$databaseId/networking`,
        title: 'Networking',
      },
      {
        to: `/databases/$engine/$databaseId/backups`,
        title: 'Backups',
      },
      {
        to: `/databases/$engine/$databaseId/resize`,
        title: 'Resize',
      },
      {
        to: settingsTabPath,
        title: 'Settings',
      },
      {
        to: `/databases/$engine/$databaseId/configs`,
        title: 'Advanced Configuration',
      },
    ] as TabInterface[],
    tabsRef
  );

  if (error) {
    return <ErrorState errorText={error[0]?.reason} />;
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

  return (
    <DatabaseDetailContext.Provider
      value={{
        database,
        disabled: isDatabasesGrantReadOnly,
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
      <div style={{ overflowX: 'auto' }}>
        <Tabs
          border={false}
          onTabsChange={(e) => handleTabChange(e.detail.index)}
          ref={tabsRef}
          tabMaxWidth={250}
        >
          {tabs.map((tab, i) => (
            <Tab
              active={i === tabIndex || undefined}
              key={String(tab.to)}
              label={tab.title}
            >
              <span slot="tab-header">
                {tab.title}
                {tab.chip}
              </span>
            </Tab>
          ))}
        </Tabs>
      </div>
      {isDatabasesGrantReadOnly && (
        <NotificationBanner
          style={{ marginBottom: Spacing.S16 }}
          text={
            "You don't have permissions to modify this Database. Please contact an account administrator for details."
          }
          type="warning"
        />
      )}
      <Outlet />
      <DatabaseLogo />
    </DatabaseDetailContext.Provider>
  );
};
