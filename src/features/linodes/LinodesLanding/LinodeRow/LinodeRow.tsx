import { compose } from 'ramda';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { StyleRulesCallback, withStyles, WithStyles, WithTheme } from 'src/components/core/styles';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import { linodeInTransition } from 'src/features/linodes/transitions';
import getLinodeType from 'src/utilities/getLinodeType';
import haveAnyBeenModified from 'src/utilities/haveAnyBeenModified';
import withDisplayType, { WithDisplayType } from '../withDisplayType';
import withRecentEvent, { WithRecentEvent } from '../withRecentEvent';
import LinodeRowWithState from './LinodeRowWithState';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface State {
  mutationAvailable: boolean;
}

interface Props {
  linodeId: number;
  linodeStatus: Linode.LinodeStatus;
  linodeIpv4: string[];
  linodeIpv6: string;
  linodeRegion: string;
  linodeType: null | string;
  linodeNotification?: string;
  linodeLabel: string;
  linodeBackups: Linode.LinodeBackups;
  linodeTags: string[];
  mostRecentBackup?: string;
  openConfigDrawer: (configs: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
  toggleConfirmation: (bootOption: Linode.BootAction,
    linodeId: number, linodeLabel: string) => void;
}

type CombinedProps =
  & Props
  & WithTypesProps
  & WithDisplayType
  & WithRecentEvent
  & WithTheme
  & WithStyles<ClassNames>;

class LinodeRow extends React.Component<CombinedProps, State> {

  shouldComponentUpdate(nextProps: CombinedProps, nextState: State) {
    return haveAnyBeenModified<CombinedProps & WithTypesProps>(
      nextProps,
      this.props,
      [
        'displayType',
        'linodeIpv4',
        'linodeIpv6',
        'linodeLabel',
        'linodeNotification',
        'linodeRegion',
        'linodeStatus',
        'mutationAvailable',
        'recentEvent',
      ],
    )
      || this.props.theme.name !== nextProps.theme.name
  }

  render() {
    const {
      linodeBackups,
      linodeId,
      linodeIpv4,
      linodeIpv6,
      linodeLabel,
      linodeRegion,
      linodeStatus,
      linodeTags,
      linodeType,
      mostRecentBackup,
      openConfigDrawer,
      toggleConfirmation,
      mutationAvailable,
      displayType,
      recentEvent,
    } = this.props;

    const loading = linodeInTransition(this.props.linodeStatus, this.props.recentEvent);

    return <LinodeRowWithState
      loading={loading}
      linodeRecentEvent={recentEvent}
      linodeBackups={linodeBackups}
      linodeId={linodeId}
      linodeIpv4={linodeIpv4}
      linodeIpv6={linodeIpv6}
      linodeLabel={linodeLabel}
      linodeRegion={linodeRegion}
      linodeStatus={linodeStatus}
      linodeTags={linodeTags}
      linodeType={linodeType}
      mostRecentBackup={mostRecentBackup}
      openConfigDrawer={openConfigDrawer}
      toggleConfirmation={toggleConfirmation}
      displayType={displayType}
      mutationAvailable={mutationAvailable}
    />;
  }
}

interface WithTypesProps {
  mutationAvailable: boolean;
}

const mapStateToProps: MapStateToProps<WithTypesProps, Props, ApplicationState> = (state, ownProps) => {
  const { linodeType } = ownProps;
  const { entities, results } = state.__resources.types;
  const type = getLinodeType(entities, results, linodeType);

  return ({
    mutationAvailable: hasMutation(type),
  })
};

const connected = connect(mapStateToProps);

export default compose(
  withStyles(styles, { withTheme: true }),
  withRecentEvent,
  withDisplayType,
  connected,
)(LinodeRow) as React.ComponentType<Props>;

const hasMutation = (type?: null | Linode.LinodeType) => {
  if (!type) {
    return false;
  }

  return !!type.successor;
}
