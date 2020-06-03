import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { compose, withProps } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import SuspenseLoader from 'src/components/SuspenseLoader';
import useReduxLoad from 'src/hooks/useReduxLoad';
import { WithTypes } from 'src/store/linodeType/linodeType.containers';
import { ThunkDispatch } from 'src/store/types';
import {
  LinodeDetailContext,
  linodeDetailContextFactory as createLinodeDetailContext,
  LinodeDetailContextProvider
} from './linodeDetailContext';
import LinodeDetailErrorBoundary from './LinodeDetailErrorBoundary';
import linodesDetailContainer, { InnerProps } from './LinodesDetail.container';
import reloadableWithRouter from './reloadableWithRouter';

const CloneLanding = React.lazy(() => import('../CloneLanding'));
const LinodesDetailHeader = React.lazy(() => import('./LinodesDetailHeader'));
const LinodesDetailNavigation = React.lazy(() =>
  import('./LinodesDetailNavigation')
);
const MigrateLanding = React.lazy(() => import('../MigrateLanding'));

interface MatchProps {
  linodeId?: string;
}

type RouteProps = RouteComponentProps<MatchProps>;

type CombinedProps = { dispatch: ThunkDispatch } & WithTypes &
  InnerProps &
  RouteProps &
  WithStyles<ClassNames> & { linodeId: number };

type ClassNames = 'backButton';

const styles = (theme: Theme) =>
  createStyles({
    backButton: {
      margin: `5px 0 0 -${theme.spacing(2)}px`,
      '& svg': {
        width: 34,
        height: 34
      }
    }
  });

const LinodeDetail: React.FC<CombinedProps> = props => {
  const {
    dispatch,
    linode,
    match: { path }
  } = props;

  const ctx: LinodeDetailContext = createLinodeDetailContext(linode, dispatch);

  /**
   * Other portions of loading state handled by maybeRenderLoading
   * (Linode info, configs, disks, etc.)
   */
  const { _loading } = useReduxLoad(['volumes', 'images']);

  if (props.loading || _loading) {
    return <CircleProgress />;
  }

  return (
    <LinodeDetailContextProvider value={ctx}>
      {/* <pre>{JSON.stringify(linode, null, 2)}</pre> */}
      <React.Suspense fallback={<SuspenseLoader />}>
        <Switch>
          {/*
          Currently, the "Clone Configs and Disks" feature exists OUTSIDE of LinodeDetail.
          Or... at least it appears that way to the user. We would like it to live WITHIN
          LinodeDetail, though, because we'd like to use the same context, so we don't
          have to reload all the configs, disks, etc. once we get to the CloneLanding page.
          */}
          <Route path={`${path}/clone`} component={CloneLanding} />
          <Route path={`${path}/migrate`} component={MigrateLanding} />
          <Route
            render={() => (
              <React.Fragment>
                <LinodesDetailHeader />
                <LinodesDetailNavigation />
              </React.Fragment>
            )}
          />
        </Switch>
      </React.Suspense>
    </LinodeDetailContextProvider>
  );
};

const reloadable = reloadableWithRouter<CombinedProps, MatchProps>(
  (routePropsOld, routePropsNew) => {
    return (
      routePropsOld.match.params.linodeId !==
      routePropsNew.match.params.linodeId
    );
  }
);

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(
  reloadable,
  withProps((ownProps: RouteProps) => ({
    linodeId: Number(ownProps.match.params.linodeId)
  })),
  styled,
  linodesDetailContainer,
  LinodeDetailErrorBoundary
);

export default enhanced(LinodeDetail);
