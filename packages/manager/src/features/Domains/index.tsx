import * as React from 'react';
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import NotFound from 'src/components/NotFound';
import SuspenseLoader from 'src/components/SuspenseLoader';
import { REFRESH_INTERVAL } from 'src/constants';
import useAccountManagement from 'src/hooks/useAccountManagement';
import useDomains from 'src/hooks/useDomains';
import useReduxLoad from 'src/hooks/useReduxLoad';

const DomainsLanding = React.lazy(() => import('./DomainsLanding'));
const DomainDetail = React.lazy(() => import('./DomainDetail'));

type CombinedProps = RouteComponentProps<{ domainId?: string }>;

const DomainsRoutes: React.FC<CombinedProps> = props => {
  const {
    match: { path }
  } = props;

  const { domains } = useDomains();
  const domainsLastUpdated = domains.lastUpdated;
  const domainsData = Object.values(domains.itemsById);

  const { _isLargeAccount } = useAccountManagement();
  useReduxLoad(['domains'], REFRESH_INTERVAL, !_isLargeAccount);

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route
          path={`${path}/:domainId`}
          exact
          strict
          render={routerProps => {
            // There are two types of Domains:
            //
            // 1. Master Domain
            // 2. Slave Domain
            //
            // Master Domains have a Detail page. Slave Domains do not.
            //
            // On the Domain Landing page, clicking on Slave Domain does not
            // navigate the user away from the Domain Landing page. Instead,
            // the "Edit Domain" drawer opens.
            //
            // We need to handle routing such that going to /domains/:domainId
            // takes the user to the Domain Landing page with the "Edit Domain"
            // drawer open.
            //
            // Thus, if this routing is matched, we look through the user's
            // domains to determine if the selected domain is a Slave Domain and
            // render the components appropriately.

            // The domainId from the URL, i.e. /domains/:domainId
            const domainId = Number(routerProps.match.params.domainId);

            // The Domain from the store that matches this ID.
            const foundDomain = (domainsData || []).find(
              thisDomain => thisDomain.id === domainId
            );

            if (!foundDomain) {
              // Did we complete a request for Domains yet? If so, this Domain doesn't exist.
              if (domainsLastUpdated > 0) {
                return <NotFound />;
              }
              // If not, we don't know if the Domain exists yet so we have to stall
              return <CircleProgress />;
            }

            // Master Domains have a Detail page.
            if (foundDomain.type === 'master') {
              return <DomainDetail {...routerProps} />;
            }

            // Slave Domains do not have a Detail page, so render the Landing
            // page with an open drawer.
            return (
              <DomainsLanding
                domainForEditing={{
                  domainId: foundDomain.id,
                  domainLabel: foundDomain.domain
                }}
                {...routerProps}
              />
            );
          }}
        />
        <Route
          path={`${path}/:domainId/records`}
          exact
          strict
          component={DomainDetail}
        />
        <Route component={DomainsLanding} path={path} exact strict />
        <Redirect to={`${path}`} />
      </Switch>
    </React.Suspense>
  );
};

const enhanced = compose<CombinedProps, {}>(withRouter);

export default enhanced(DomainsRoutes);
