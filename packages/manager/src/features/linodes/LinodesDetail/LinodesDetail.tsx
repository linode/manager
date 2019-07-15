import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { compose, withProps } from 'recompose';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import DefaultLoader from 'src/components/DefaultLoader';
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

const CloneLanding = DefaultLoader({
  loader: () => import('../CloneLanding')
});

const LinodesDetailHeader = DefaultLoader({
  loader: () => import('./LinodesDetailHeader')
});

const LinodesDetailNavigation = DefaultLoader({
  loader: () => import('./LinodesDetailNavigation')
});

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

const LinodeDetail: React.StatelessComponent<CombinedProps> = props => {
  const {
    dispatch,
    linode,
    match: { path }
  } = props;

  const ctx: LinodeDetailContext = createLinodeDetailContext(linode, dispatch);

  return (
    <LinodeDetailContextProvider value={ctx}>
      {/* <pre>{JSON.stringify(linode, null, 2)}</pre> */}
      <Switch>
        {/*
        Currently, the "Clone Configs and Disks" feature exists OUTSIDE of LinodeDetail.
        Or... at least it appears that way to the user. We would like it to live WITHIN
        LinodeDetail, though, because we'd like to use the same context, so we don't
        have to reload all the configs, disks, etc. once we get to the CloneLanding page.
        */}
        <Route path={`${path}/clone`} component={CloneLanding} />
        <Route
          render={() => (
            <React.Fragment>
              <LinodesDetailHeader />
              <LinodesDetailNavigation />
            </React.Fragment>
          )}
        />
      </Switch>
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
