import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose, withProps } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import ErrorState from 'src/components/ErrorState';
import NotFound from 'src/components/NotFound';
import { userLinodeConfigsRequest } from 'src/hooks/linodeConfigsRequest.hook';
import { useLinodeDisksRequest } from 'src/hooks/linodeDisksRequest.hook';
import {
  LinodeActionsProps,
  withLinodeActions
} from 'src/store/linodes/linode.containers';
import { WithTypes } from 'src/store/linodeType/linodeType.containers';
import { Context, LinodeProvider } from './context';
import LinodeDetailErrorBoundary from './LinodeDetailErrorBoundary';
import linodesDetailContainer, {
  InnerProps as WithLinodeProps
} from './LinodesDetail.container';
import LinodesDetailHeader from './LinodesDetailHeader';
import LinodesDetailNavigation from './LinodesDetailNavigation';
import reloadableWithRouter from './reloadableWithRouter';

interface MatchProps {
  linodeId?: string;
}

type RouteProps = RouteComponentProps<MatchProps>;

type CombinedProps = LinodeActionsProps &
  WithTypes &
  WithLinodeProps &
  RouteProps &
  WithStyles<ClassNames> & { linodeId: number };

type ClassNames = 'backButton';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  backButton: {
    margin: '5px 0 0 -16px',
    '& svg': {
      width: 34,
      height: 34
    }
  }
});

const LinodeDetail: React.StatelessComponent<CombinedProps> = props => {
  const { linodeId, linode } = props;

  const {
    data: configs,
    loading: configsLoading,
    error: configsError
  } = userLinodeConfigsRequest(linodeId, true);

  const {
    data: disks,
    loading: disksLoading,
    error: disksError
  } = useLinodeDisksRequest(linodeId, true);

  if (configsError) {
    return <ErrorState errorText="Unable to retrieve Linode configuration." />;
  }

  if (disksError) {
    return <ErrorState errorText="Unable to retrieve Linode disks." />;
  }

  const anyLoading = configsLoading || disksLoading;

  if (anyLoading) {
    return <CircleProgress />;
  }

  if (!linode) {
    return <NotFound />;
  }

  const { linodeActions } = props;

  const updatedContext: Context = {
    updateLinode: (data: Partial<Linode.Linode>) =>
      linodeActions.updateLinode({ linodeId, ...data }),
    linode: {
      ...linode,
      _configs: configs,
      _disks: disks
    }
  };

  return (
    <LinodeProvider value={updatedContext}>
      <LinodesDetailHeader />
      <LinodesDetailNavigation />
    </LinodeProvider>
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

  /** Maps the Linode ID from the route param to a number as a top level prop. */
  withProps((ownProps: RouteProps) => ({
    linodeId: Number(ownProps.match.params.linodeId)
  })),

  linodesDetailContainer,

  /** linode is defined */
  styled,

  /** Creating the context object in props. */
  withLinodeActions,

  LinodeDetailErrorBoundary
);

export default enhanced(LinodeDetail);
