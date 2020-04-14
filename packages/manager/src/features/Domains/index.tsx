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
import DefaultLoader from 'src/components/DefaultLoader';
import NotFound from 'src/components/NotFound';
import { REFRESH_INTERVAL } from 'src/constants';
import withDomains, {
  Props as DomainProps
} from 'src/containers/domains.container';

const DomainsLanding = DefaultLoader({
  loader: () => import('./DomainsLanding')
});

const DomainDetail = DefaultLoader({
  loader: () => import('./DomainDetail')
});

type CombinedProps = RouteComponentProps<{ domainId?: string }> & DomainProps;

class DomainsRoutes extends React.Component<CombinedProps> {
  componentDidMount() {
    const { domainsLastUpdated, domainsLoading, getAllDomains } = this.props;
    if (Date.now() - domainsLastUpdated > REFRESH_INTERVAL && !domainsLoading) {
      getAllDomains();
    }
  }

  render() {
    const {
      domainsLastUpdated,
      match: { path }
    } = this.props;

    return (
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
            const foundDomain = (this.props.domainsData || []).find(
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
    );
  }
}

const enhanced = compose<CombinedProps, {}>(withRouter, withDomains());

export default enhanced(DomainsRoutes);
