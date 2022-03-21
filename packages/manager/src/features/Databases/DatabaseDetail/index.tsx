import { Engine } from '@linode/api-v4/lib/databases/types';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { matchPath, useHistory, useParams } from 'react-router-dom';
import Breadcrumb from 'src/components/Breadcrumb';
import CircleProgress from 'src/components/CircleProgress';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabLinkList from 'src/components/TabLinkList';
import useEditableLabelState from 'src/hooks/useEditableLabelState';
import {
  useDatabaseMutation,
  useDatabaseQuery,
  useDatabaseTypesQuery,
} from 'src/queries/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

const DatabaseSummary = React.lazy(() => import('./DatabaseSummary'));
const DatabaseBackups = React.lazy(() => import('./DatabaseBackups'));
const DatabaseSettings = React.lazy(() => import('./DatabaseSettings'));

export const DatabaseDetail: React.FC = () => {
  const history = useHistory();

  const { databaseId, engine } = useParams<{
    databaseId: string;
    engine: Engine;
  }>();

  const id = Number(databaseId);

  const { data: database, isLoading, error } = useDatabaseQuery(engine, id);
  const { isLoading: isTypesLoading } = useDatabaseTypesQuery();

  const { mutateAsync: updateDatabase } = useDatabaseMutation(engine, id);

  const {
    editableLabelError,
    setEditableLabelError,
    resetEditableLabel,
  } = useEditableLabelState();

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

  const tabs = [
    {
      title: 'Summary',
      routeName: `/databases/${engine}/${id}/summary`,
    },
    {
      title: 'Backups',
      routeName: `/databases/${engine}/${id}/backups`,
    },
    {
      title: 'Settings',
      routeName: `/databases/${engine}/${id}/settings`,
    },
  ];

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
      <Breadcrumb
        pathname={location.pathname}
        labelTitle={database.label}
        firstAndLastOnly
        crumbOverrides={[
          {
            position: 1,
            label: 'Database Clusters',
          },
        ]}
        labelOptions={{ noCap: true }}
        onEditHandlers={{
          editableTextTitle: database.label,
          onEdit: handleSubmitLabelChange,
          onCancel: resetEditableLabel,
          errorText: editableLabelError,
        }}
      />
      <Tabs index={getTabIndex()} onChange={handleTabChange}>
        <TabLinkList tabs={tabs} />
        <TabPanels>
          <SafeTabPanel index={0}>
            <DatabaseSummary database={database} />
          </SafeTabPanel>
          <SafeTabPanel index={1}>
            <DatabaseBackups />
          </SafeTabPanel>
          <SafeTabPanel index={2}>
            <DatabaseSettings database={database} />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default DatabaseDetail;
