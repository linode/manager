import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/merge';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import VolumesIcon from 'src/assets/addnewmenu/volume.svg';
import Placeholder from 'src/components/Placeholder';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
// import { events$ } from 'src/events';
import { getVolumes } from 'src/services/volumes';
import { openForCreating } from 'src/store/reducers/volumeDrawer';

import VolumesLanding from './VolumesLanding';

export const updateVolumes$ = new Subject<boolean>();

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  volumes: PromiseLoaderResponse<Linode.Volume[]>;
  openForCreating: typeof openForCreating;
}

interface State {
  volumes: Linode.Volume[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class Volumes extends React.Component<CombinedProps, State> {
  eventsSub: Subscription;
  mounted: boolean = false;

  state = {
    volumes: pathOr([], ['response', 'data'], this.props.volumes),
  };

  componentDidMount() {
    this.mounted = true;

    // const maybeAddEvent = (e: boolean | Linode.Event, volume: Linode.Volume) => {
    //   if (typeof e === 'boolean') { return {} };
    //   if (!e.entity || e.entity.id !== volume.id) { return {} }
    //   return { recentEvent: e };
    // };

    // this.eventsSub = events$
    //   .filter(event => (
    //     !event._initial
    //     && [
    //       'volume_create',
    //       'volume_attach',
    //       'volume_delete',
    //       'volume_detach',
    //       'volume_resize',
    //       'volume_clone',
    //     ].includes(event.action)
    //   ))
    //   .merge(updateVolumes$)
    //   .subscribe((event) => {
    //     getVolumes()
    //       .then((volumes) => {
    //         this.setState({
    //           volumes: volumes.data.map((v) => ({
    //             ...v,
    //             ...maybeAddEvent(event, v),
    //           })),
    //         });
    //       })
    //       .catch(() => {
    //         /* @todo: how do we want to display this error? */
    //       });
    //   });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  openVolumesDrawer() {
    this.props.openForCreating();
  }

  render() {
    const { volumes } = this.state;
    return (
      <React.Fragment>
        {volumes.length
          ? <VolumesLanding
            volumes={volumes}
          />
          : <Placeholder
            title="Create a Volume"
            copy="Add storage to your Linodes using the resilient Volumes service"
            icon={VolumesIcon}
            buttonProps={{
              onClick: () => this.openVolumesDrawer(),
              children: 'Create a Volume',
            }}
          />
        }
      </React.Fragment>
    );
  }
}

const preloaded = PromiseLoader<CombinedProps>({
  volumes: (props: Props) => getVolumes(),
});

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators(
  { openForCreating },
  dispatch,
);

const connected = connect(undefined, mapDispatchToProps);

const styled = withStyles(styles, { withTheme: true });

export default compose(
  connected,
  styled,
  preloaded,
  SectionErrorBoundary,
)(Volumes);
