import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose, withProps } from 'recompose';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import { WithTypes } from 'src/store/linodeType/linodeType.containers';
import { ThunkDispatch } from 'src/store/types';
import {
  LinodeDetailContext,
  linodeDetailContextFactory as createLinodeDetailContext,
  LinodeDetailContextProvider
} from './linodeDetailContext';
import LinodeDetailErrorBoundary from './LinodeDetailErrorBoundary';
import linodesDetailContainer, { InnerProps } from './LinodesDetail.container';
import LinodesDetailHeader from './LinodesDetailHeader';
import LinodesDetailNavigation from './LinodesDetailNavigation';
import reloadableWithRouter from './reloadableWithRouter';

interface MatchProps {
  linodeId?: string;
}

type RouteProps = RouteComponentProps<MatchProps>;

type CombinedProps = { dispatch: ThunkDispatch } & WithTypes &
  InnerProps &
  RouteProps &
  WithStyles<ClassNames> & { linodeId: number };

type ClassNames = 'backButton';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  backButton: {
    margin: `5px 0 0 -${theme.spacing.unit * 2}px`,
    '& svg': {
      width: 34,
      height: 34
    }
  }
});

const LinodeDetail: React.StatelessComponent<CombinedProps> = props => {
  const { linode } = props;

  const { dispatch } = props;

  const ctx: LinodeDetailContext = createLinodeDetailContext(linode, dispatch);

  return (
    <LinodeDetailContextProvider value={ctx}>
      {/* <pre>{JSON.stringify(linode, null, 2)}</pre> */}
      <LinodesDetailHeader />
      <LinodesDetailNavigation />
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
