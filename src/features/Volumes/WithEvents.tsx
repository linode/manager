import * as React from 'react';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { events$ } from 'src/events';

export const updateVolumes$ = new Subject<boolean>();

interface State {
  volumes?: Linode.Volume[];
}

export default () => (WrappedComponent: React.ComponentType<any>) => {
  return class extends React.Component<any, State> {
    state: State = {
      volumes: undefined,
    }
    eventsSub: Subscription;

    mounted: boolean = false;

    componentDidMount() {
      this.mounted = true;
      this.eventsSub = events$
        .filter(event => (
          !event._initial
          && [
            'volume_create',
            'volume_attach',
            'volume_delete',
            'volume_detach',
            'volume_resize',
            'volume_clone',
          ].includes(event.action)
        ))
        .merge(updateVolumes$)
        .subscribe((event) => {
          this.props.request()
            .then(() => {
              if (!this.mounted || !this.props.data) { return; }

              this.setState({
                volumes: this.props.data.map((eachVolume: Linode.Volume) => ({
                  ...eachVolume,
                  ...maybeAddEvent(event, eachVolume),
                }))
              })
            })
        });
    }

    componentWillMount() {
      this.mounted = false;
    }

    render() {
      return (
        <WrappedComponent {...this.props} data={this.state.volumes || this.props.data} />
      )
    }
  }
};

const maybeAddEvent = (e: boolean | Linode.Event, volume: Linode.Volume) => {
  if (typeof e === 'boolean') { return {} };
  if (!e.entity || e.entity.id !== volume.id) { return {} }
  return { recentEvent: e };
};
