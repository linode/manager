import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { Divider } from 'src/components/Divider';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { Paper } from 'src/components/Paper';
import { useCloudViewNameSpacesQuery } from 'src/queries/cloudview/namespaces';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { CreateNamespaceDrawer } from './CreateNamespace/CreateNamespaceDrawer';
import { NamespaceLandingEmptyState } from './NamespaceLandingEmptyState';
import { NamespaceList } from './NamespaceList/NamespaceList';

export const Namespaces = React.memo(() => {
  const location = useLocation();
  const history = useHistory();

  const { data, error, isLoading } = useCloudViewNameSpacesQuery();

  const isCreateNamespaceDrawerOpen = location.pathname.endsWith('create');

  const onOpenCreateDrawer = () => {
    history.replace('/cloudview/namespaces/create');
  };

  const onCloseCreateDrawer = () => {
    history.replace('/cloudview/namespaces');
  };

  if (isLoading) {
    return <CircleProgress />;
  }

  if (data?.results === 0 || data?.data == undefined) {
    return (
      <>
        <Paper>
          <LandingHeader
            breadcrumbProps={{ pathname: '/Namespaces' }}
            docsLabel="Docs"
            docsLink="https://www.linode.com/docs/"
          />
          <Divider orientation="horizontal"></Divider>
          <NamespaceLandingEmptyState
            openAddNamespaceDrawer={onOpenCreateDrawer}
          />
        </Paper>
        <CreateNamespaceDrawer
          onClose={onCloseCreateDrawer}
          open={isCreateNamespaceDrawerOpen}
        />
      </>
    );
  }

  if (error) {
    return (
      <Paper>
        <ErrorState
          errorText={
            getAPIErrorOrDefault(error, 'Error loading your Namespaces.')[0]
              .reason
          }
        />
      </Paper>
    );
  }
  return (
    <React.Fragment>
      <Paper>
        <LandingHeader
          breadcrumbProps={{ pathname: '/Namespaces' }}
          docsLabel="Docs"
          docsLink="https://www.linode.com/docs/"
          entity="Namespace"
          onButtonClick={onOpenCreateDrawer}
        />
        <NamespaceList namespacesList={data.data}></NamespaceList>
      </Paper>
      <CreateNamespaceDrawer
        onClose={onCloseCreateDrawer}
        open={isCreateNamespaceDrawerOpen}
      />
    </React.Fragment>
  );
});
