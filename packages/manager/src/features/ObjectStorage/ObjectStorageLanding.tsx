import * as React from 'react';
import { connect } from 'react-redux';
import {
  matchPath,
  Redirect,
  Route,
  RouteComponentProps,
  Switch
} from 'react-router-dom';
import { compose } from 'recompose';
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
import useObjectStorageBuckets from 'src/hooks/useObjectStorageBuckets';
import useObjectStorageClusters from 'src/hooks/useObjectStorageClusters';
import { MapState } from 'src/store/types';
import BucketDrawer from './BucketLanding/BucketDrawer';
import useReduxLoad from 'src/hooks/useReduxLoad';

const BucketLanding = React.lazy(() => import('./BucketLanding/BucketLanding'));
const AccessKeyLanding = React.lazy(() =>
  import('./AccessKeyLanding/AccessKeyLanding')
);

const useStyles = makeStyles((theme: Theme) => ({
  promo: {
    marginBottom: theme.spacing() / 2
  }
}));

type CombinedProps = StateProps & RouteComponentProps<{}>;

export const ObjectStorageLanding: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  useReduxLoad(['clusters']);

  const { objectStorageClusters } = useObjectStorageClusters();
  const {
    objectStorageBuckets,
    requestObjectStorageBuckets
  } = useObjectStorageBuckets();

  const tabs = [
    /* NB: These must correspond to the routes, inside the Switch */
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

  const { isRestrictedUser } = props;

  const clustersLoaded = objectStorageClusters.lastUpdated > 0;

  const bucketsLoadingOrLoaded =
    objectStorageBuckets.loading ||
    objectStorageBuckets.lastUpdated > 0 ||
    objectStorageBuckets.bucketErrors;

  React.useEffect(() => {
    // Object Storage is not available for restricted users.
    if (isRestrictedUser) {
      return;
    }

    // Once the OBJ Clusters have been loaded, request buckets from each cluster.
    if (clustersLoaded && !bucketsLoadingOrLoaded) {
      const clusterIds = objectStorageClusters.entities.map(
        thisCluster => thisCluster.id
      );

      requestObjectStorageBuckets(clusterIds).catch(() => {
        /** We choose to do nothing, relying on the Redux error state. */
      });
    }
  }, [
    isRestrictedUser,
    clustersLoaded,
    bucketsLoadingOrLoaded,
    objectStorageClusters,
    requestObjectStorageBuckets
  ]);

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

  const renderBucketLanding = React.useCallback(
    () => <BucketLanding isRestrictedUser={props.isRestrictedUser} />,
    [props.isRestrictedUser]
  );

  const renderAccessKeyLanding = React.useCallback(
    () => <AccessKeyLanding isRestrictedUser={props.isRestrictedUser} />,
    [props.isRestrictedUser]
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
            render={renderBucketLanding}
          />
          <Route
            exact
            strict
            path={`${url}/access-keys`}
            render={renderAccessKeyLanding}
          />
          <Redirect to={`${url}/buckets`} />
        </Switch>
      </React.Suspense>
      <BucketDrawer isRestrictedUser={props.isRestrictedUser} />
    </React.Fragment>
  );
};

interface StateProps {
  isRestrictedUser: boolean;
}

const mapStateToProps: MapState<StateProps, {}> = state => ({
  isRestrictedUser: state.__resources.profile.data?.restricted ?? true
});

export const connected = connect(mapStateToProps);

const enhanced = compose(connected, React.memo);

export default enhanced(ObjectStorageLanding);
