import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose, withProps } from 'recompose';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import {
  LinodeActionsProps,
  withLinodeActions
} from 'src/store/linodes/linode.containers';
import { WithTypes } from 'src/store/linodeType/linodeType.containers';
import { Context, IncrediblyExtendedLinode, LinodeProvider } from './context';
import LinodeDetailErrorBoundary from './LinodeDetailErrorBoundary';
import linodesDetailContainer from './LinodesDetail.container';
import LinodesDetailHeader from './LinodesDetailHeader';
import LinodesDetailNavigation from './LinodesDetailNavigation';
import reloadableWithRouter from './reloadableWithRouter';

interface MatchProps {
  linodeId?: string;
}

type RouteProps = RouteComponentProps<MatchProps>;

type CombinedProps = LinodeActionsProps &
  WithTypes & { linode: IncrediblyExtendedLinode } & RouteProps &
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

  const { linodeActions } = props;

  const updatedContext: Context = {
    updateLinode: (data: Partial<Linode.Linode>) =>
      linodeActions.updateLinode({ linodeId, ...data }),
    linode
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

  withProps((ownProps: RouteProps) => ({
    linodeId: Number(ownProps.match.params.linodeId)
  })),

  styled,

  withLinodeActions,

  linodesDetailContainer,

  LinodeDetailErrorBoundary
);

export default enhanced(LinodeDetail);
