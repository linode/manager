import { compose } from 'ramda';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { StyleRulesCallback, withStyles, WithStyles, WithTheme } from 'src/components/core/styles';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import { linodeInTransition } from 'src/features/linodes/transitions';
import recentEventForLinode from 'src/store/selectors/recentEventForLinode';
import haveAnyBeenModified from 'src/utilities/haveAnyBeenModified';
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
  & WithTheme
  & WithStyles<ClassNames>;

class LinodeRow extends React.Component<CombinedProps, State> {

  shouldComponentUpdate(nextProps: CombinedProps, nextState: State) {
    return haveAnyBeenModified<Props & WithTypesProps>(
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
  displayType: string;
  recentEvent?: Linode.Event;
}

const mapStateToProps: MapStateToProps<WithTypesProps, Props, ApplicationState> = (state, ownProps) => {
  const { linodeType, linodeId } = ownProps;
  const { entities, results } = state.__resources.types;


  const type = getType(entities, results, linodeType);

  return ({
    displayType: type === null ? 'No Plan' : type === undefined ? 'Unknown Plan' : type.label,
    mutationAvailable: hasMutation(type),
    recentEvent: recentEventForLinode(linodeId)(state),
  })
};

const connected = connect(mapStateToProps);

export default compose(
  withStyles(styles, { withTheme: true }),
  connected,
)(LinodeRow) as React.ComponentType<Props>;

const getType = <T extends any>(entities: T[], ids: string[], id: null | string) => {
  if (id === null) {
    return null;
  }

  const foundIndex = ids.indexOf(id);
  return foundIndex > -1 ? entities[foundIndex] : undefined
}

const hasMutation = (type?: null | Linode.LinodeType) => {
  if (!type) {
    return false;
  }

  return !!type.successor;
}
