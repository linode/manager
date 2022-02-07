import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import SuspenseLoader from 'src/components/SuspenseLoader';
import useAccountManagement from 'src/hooks/useAccountManagement';
import useFlags from 'src/hooks/useFlags';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';

const DatabaseLanding = React.lazy(() => import('./DatabaseLanding'));
const DatabaseDetail = React.lazy(() => import('./DatabaseDetail'));
const DatabaseCreate = React.lazy(() => import('./DatabaseCreate'));

const Database: React.FC = () => {
  // @TODO: Remove when Database goes to GA
  const { account } = useAccountManagement();
  const flags = useFlags();

  const showDatabases = isFeatureEnabled(
    'Managed Databases',
    Boolean(flags.databases),
    account?.capabilities ?? []
  );

  if (!showDatabases) {
    return null;
  }

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <DocumentTitleSegment segment="Databases" />
      <Switch>
        <Route component={DatabaseCreate} path="/databases/create" />
        <Route
          component={DatabaseDetail}
          path="/databases/:engine/:databaseId"
        />
        <Route component={DatabaseLanding} exact strict />
      </Switch>
    </React.Suspense>
  );
};

export default Database;
