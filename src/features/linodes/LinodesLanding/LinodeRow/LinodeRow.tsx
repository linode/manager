import { compose } from 'ramda';
import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles, WithTheme } from 'src/components/core/styles';
import { withTypes } from 'src/context/types';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import { linodeInTransition } from 'src/features/linodes/transitions';
import { getType } from 'src/services/linodes';
import haveAnyBeenModified from 'src/utilities/haveAnyBeenModified';
import LinodeRowLoaded from './LinodeRowLoaded';
import LinodeRowLoading from './LinodeRowLoading';

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
  linodeRecentEvent?: Linode.Event;
  mostRecentBackup?: string;
  openConfigDrawer: (configs: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
  toggleConfirmation: (bootOption: Linode.BootAction,
    linodeId: number, linodeLabel: string) => void;
}

interface TypesContextProps {
  typesData?: Linode.LinodeType[];
  typesLoading: boolean;
}

type CombinedProps =
  & Props
  & TypesContextProps
  & WithTheme
  & WithStyles<ClassNames>;

class LinodeRow extends React.Component<CombinedProps, State> {
  state: State = {
    mutationAvailable: false,
  }

  shouldComponentUpdate(nextProps: CombinedProps, nextState: State) {
    return haveAnyBeenModified<Props & TypesContextProps>(
      nextProps,
      this.props,
      [
        'linodeStatus',
        'linodeRegion',
        'linodeNotification',
        'linodeRecentEvent',
        'linodeLabel',
        'linodeIpv6',
        'linodeIpv4',
        'typesData',
        'typesLoading',
      ],
    )
      || haveAnyBeenModified<State>(
        nextState,
        this.state,
        ['mutationAvailable']
      )
      || this.props.theme.name !== nextProps.theme.name
  }

  componentDidMount() {
    const { linodeType } = this.props;
    if (!linodeType) { return }
    getType(linodeType)
      .then((data: Linode.LinodeType) => {
        if (data.successor && data.successor !== null) {
          this.setState({ mutationAvailable: true })
        }
      })
      .catch((e: Error) => e)
  }
  render() {
    const {
      linodeBackups,
      linodeId,
      linodeIpv4,
      linodeIpv6,
      linodeLabel,
      linodeRecentEvent,
      linodeRegion,
      linodeStatus,
      linodeTags,
      linodeType,
      mostRecentBackup,
      openConfigDrawer,
      toggleConfirmation,
      typesData,
      typesLoading,
    } = this.props;

    const { mutationAvailable } = this.state;

    const loading = linodeInTransition(this.props.linodeStatus, this.props.linodeRecentEvent);

    return loading
      ? <LinodeRowLoading
        linodeId={linodeId}
        linodeLabel={linodeLabel}
        linodeRecentEvent={linodeRecentEvent}
        linodeStatus={linodeStatus}
        linodeTags={linodeTags}
      />
      : <LinodeRowLoaded
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
        typesData={typesData}
        typesLoading={typesLoading}
        mutationAvailable={mutationAvailable}
      />
  }
}

const typesContext = withTypes(({ loading: typesLoading, data: typesData }) => ({
  typesLoading,
  typesData,
}));

export default compose(
  withStyles(styles, { withTheme: true }),
  typesContext,
)(LinodeRow) as React.ComponentType<Props>;
