import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose, withProps } from 'recompose';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import {
  withLinodeConfigActions,
  WithLinodeConfigActions
} from 'src/store/linodes/config/config.containers';
import {
  withLinodeDiskActions,
  WithLinodeDiskActions
} from 'src/store/linodes/disk/disk.containers';
import {
  LinodeActionsProps,
  withLinodeActions
} from 'src/store/linodes/linode.containers';
import { WithTypes } from 'src/store/linodeType/linodeType.containers';
import { Context, LinodeProvider } from './context';
import LinodeDetailErrorBoundary from './LinodeDetailErrorBoundary';
import linodesDetailContainer, { InnerProps } from './LinodesDetail.container';
import LinodesDetailHeader from './LinodesDetailHeader';
import LinodesDetailNavigation from './LinodesDetailNavigation';
import reloadableWithRouter from './reloadableWithRouter';

interface MatchProps {
  linodeId?: string;
}

type RouteProps = RouteComponentProps<MatchProps>;

type CombinedProps = LinodeActionsProps &
  WithLinodeConfigActions &
  WithLinodeDiskActions &
  WithTypes &
  InnerProps &
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

  const { linodeActions, linodeConfigActions, linodeDiskActions } = props;

  const updatedContext: Context = {
    /**
     * Here we're actually building the context object.
     * This should include not only the extended Linode, but handlers
     * bound to the Linode instance (The Linode ID already applied to the request).
     */

    /** Linode actions */
    updateLinode: (data: Partial<Linode.Linode>) =>
      linodeActions.updateLinode({ linodeId, ...data }),

    /** Linode Config actions */
    getLinodeConfig: configId =>
      linodeConfigActions.getLinodeConfig({ linodeId, configId }),

    getLinodeConfigs: () => linodeConfigActions.getLinodeConfigs({ linodeId }),

    updateLinodeConfig: (configId, data) =>
      linodeConfigActions.updateLinodeConfig({ linodeId, configId, ...data }),

    createLinodeConfig: data =>
      linodeConfigActions.createLinodeConfig({ linodeId, ...data }),

    deleteLinodeConfig: configId =>
      linodeConfigActions.deleteLinodeConfig({ linodeId, configId }),

    /** Linode Disk actions */
    getLinodeDisk: diskId =>
      linodeDiskActions.getLinodeDisk({ linodeId, diskId }),

    getLinodeDisks: () => linodeDiskActions.getLinodeDisks({ linodeId }),

    updateLinodeDisk: (diskId, data) =>
      linodeDiskActions.updateLinodeDisk({ linodeId, diskId, ...data }),

    createLinodeDisk: data =>
      linodeDiskActions.createLinodeDisk({ linodeId, ...data }),

    deleteLinodeDisk: diskId =>
      linodeDiskActions.deleteLinodeDisk({ linodeId, diskId }),

    resizeLinodeDisk: (diskId, size) =>
      linodeDiskActions.resizeLinodeDisk({ linodeId, diskId, size }),

    linode
  };

  return (
    <LinodeProvider value={updatedContext}>
      <pre>{JSON.stringify(linode, null, 2)}</pre>
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
  withLinodeConfigActions,
  withLinodeDiskActions,
  linodesDetailContainer,
  LinodeDetailErrorBoundary
);

export default enhanced(LinodeDetail);
