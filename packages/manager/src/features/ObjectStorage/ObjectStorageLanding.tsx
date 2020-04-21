import {
  ObjectStorageBucket,
  ObjectStorageCluster
} from 'linode-js-sdk/lib/object-storage';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import {
  matchPath,
  Redirect,
  Route,
  RouteComponentProps,
  Switch
} from 'react-router-dom';
import { compose } from 'recompose';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import Breadcrumb from 'src/components/Breadcrumb';
import AppBar from 'src/components/core/AppBar';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import DocumentationButton from 'src/components/DocumentationButton';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import PromotionalOfferCard from 'src/components/PromotionalOfferCard/PromotionalOfferCard';
import SuspenseLoader from 'src/components/SuspenseLoader';
import TabLink from 'src/components/TabLink';
import useFlags from 'src/hooks/useFlags';
import { ApplicationState } from 'src/store';
import { getAllBuckets } from 'src/store/bucket/bucket.requests';
import { requestClusters as _requestClusters } from 'src/store/clusters/clusters.actions';
import { MapState } from 'src/store/types';
import BucketDrawer from './BucketLanding/BucketDrawer';

const BucketLanding = React.lazy(() => import('./BucketLanding/BucketLanding'));
const AccessKeyLanding = React.lazy(() =>
  import('./AccessKeyLanding/AccessKeyLanding')
);

const useStyles = makeStyles((theme: Theme) => ({
  promo: {
    marginBottom: theme.spacing() / 2
  }
}));

type CombinedProps = StateProps & DispatchProps & RouteComponentProps<{}>;

export const ObjectStorageLanding: React.FunctionComponent<CombinedProps> = props => {
  const classes = useStyles();

  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    {
      title: 'Buckets',
      routeName: `${props.match.url}/buckets`
    },
    {
      title: 'Access Keys',
      routeName: `${props.match.url}/access-keys`
    }
  ];

  const handleTabChange = (
    _: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    const routeName = tabs[value].routeName;
    props.history.push(`${routeName}`);
  };

  React.useEffect(() => {
    const {
      bucketsLastUpdated,
      clustersLastUpdated,
      isRestrictedUser,
      requestBuckets,
      requestClusters
    } = props;

    // Object Storage is not available for restricted users, so we avoid these
    // requests if the user is restricted.
    if (isRestrictedUser) {
      return;
    }

    /**
     * @todo: Move these requests to App.tsx like other entities when OBJ is generally available.
     */

    // Request buckets if we haven't already
    if (bucketsLastUpdated === 0) {
      requestBuckets().catch(err => {
        /** We choose to do nothing, relying on the Redux error state. */
      });
    }

    // Request clusters if we haven't already
    if (clustersLastUpdated === 0) {
      requestClusters().catch(err => {
        /** We choose to do nothing, relying on the Redux error state. */
      });
    }
  }, [props.isRestrictedUser]);

  const url = props.match.url;
  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };

  const flags = useFlags();

  const objPromotionalOffers = (
    flags.promotionalOffers ?? []
  ).filter(promotionalOffer =>
    promotionalOffer.features.includes('Object Storage')
  );

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Object Storage" />
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Breadcrumb
          pathname={props.location.pathname}
          labelTitle="Object Storage"
          removeCrumbX={1}
        />
        <DocumentationButton href="https://www.linode.com/docs/platform/object-storage/" />
      </Box>
      <AppBar position="static" color="default" role="tablist">
        <Tabs
          value={tabs.findIndex(tab => matches(tab.routeName))}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="on"
        >
          {tabs.map(tab => (
            <Tab
              key={tab.title}
              data-qa-tab={tab.title}
              component={React.forwardRef((forwardedProps, ref) => (
                <TabLink
                  to={tab.routeName}
                  title={tab.title}
                  {...forwardedProps}
                  ref={ref}
                />
              ))}
            />
          ))}
        </Tabs>
      </AppBar>
      {objPromotionalOffers.map(promotionalOffer => (
        <PromotionalOfferCard
          key={promotionalOffer.name}
          {...promotionalOffer}
          fullWidth
          className={classes.promo}
        />
      ))}
      <React.Suspense fallback={<SuspenseLoader />}>
        <Switch>
          <Route
            exact
            strict
            path={`${url}/buckets`}
            render={() => (
              <BucketLanding isRestrictedUser={props.isRestrictedUser} />
            )}
          />
          <Route
            exact
            strict
            path={`${url}/access-keys`}
            render={() => (
              <AccessKeyLanding isRestrictedUser={props.isRestrictedUser} />
            )}
          />
          <Redirect to={`${url}/buckets`} />
        </Switch>
      </React.Suspense>
      <BucketDrawer isRestrictedUser={props.isRestrictedUser} />
    </React.Fragment>
  );
};

interface StateProps {
  bucketsLastUpdated: number;
  clustersLastUpdated: number;
  isRestrictedUser: boolean;
}

const mapStateToProps: MapState<StateProps, {}> = state => ({
  bucketsLastUpdated: state.__resources.buckets.lastUpdated,
  clustersLastUpdated: state.__resources.clusters.lastUpdated,
  isRestrictedUser: pathOr(
    true,
    ['__resources', 'profile', 'data', 'restricted'],
    state
  )
});

interface DispatchProps {
  requestBuckets: () => Promise<ObjectStorageBucket[]>;
  requestClusters: () => Promise<ObjectStorageCluster[]>;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, Action<any>>
) => {
  return {
    requestBuckets: () => dispatch(getAllBuckets()),
    requestClusters: () => dispatch(_requestClusters())
  };
};

export const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = compose<CombinedProps, {}>(connected);
export default enhanced(ObjectStorageLanding);
