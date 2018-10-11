import { clone } from 'ramda';
import * as React from 'react';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { events$ } from 'src/events';

import { getLinode } from 'src/services/linodes';
import { getVolume } from 'src/services/volumes';

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
        .subscribe((event: Linode.Event) => {
          const entityId = event.entity!.id

          if (event.action === 'volume_delete') {
            console.log('deleting')
            return this.props.request();
          }
          
          getVolume(entityId)
            .then((volume: Linode.Volume) => {
              if (!this.mounted || !this.props.data) { return; }

              /*
               * find the index of the volume we have to update/replace, depending on whether if
               * state exists. This solves the problem where the component would
               * be updating old data
               */
              const targetIndex = (this.state.volumes || this.props.data)
                .findIndex((eachVolume: Linode.Volume) => {
                  return eachVolume.id === entityId;
                });

              // if the volume never appeared in original list of Linodes, no updating needed
              if (targetIndex === -1) {
                return;
              }

              /*
               * make a clone of state or prop data, depending on whether if
               * state exists. This solves the problem where the component would
               * be updating old data
               */
              const clonedVolumes = clone(this.state.volumes || this.props.data);

              /*
               * If the volume has a Linode ID, it means that it's just been
               * attached. So, now we have to make a request to the Linode
               * that it was just attached to, so that we can display that in
               * the table row 
               */
              if (!!volume.linode_id) {
                return getLinode(volume.linode_id)
                  .then((response) => {
                    const linode = response.data;

                    /*
                     * Now add our new volume, include the newly attached
                     * Linode data to the master list 
                     */
                    clonedVolumes[targetIndex] = {
                      ...volume,
                      ...maybeAddEvent(event, volume),
                      linodeLabel: linode.label,
                      linodeStatus: linode.status,
                    }

                    // finally update the master list of volumes in state
                    this.setState({
                      volumes: clonedVolumes
                    })
                  })
              }

              // now add our new volume with the event data to the master list of volumes
              clonedVolumes[targetIndex] = {
                ...volume,
                ...maybeAddEvent(event, volume)
              }

              // finally update the master list of volumes
              this.setState({
                volumes: clonedVolumes
              });
              return;
            })
        });
    }

    componentWillUnmount() {
      this.mounted = false;
    }

    componentDidUpdate(prevProps: any, prevState: any) {
      /*
       * If our data returned from Pagey is different from the original data,
       * it means we either changed pages or page size. In this case, override
       * whatever state we might have set in the events stream logic 
       */
      if (prevProps.data !== this.props.data) {
        this.setState({ volumes: this.props.data })
      }
    }

    render() {
      return (
        /* 
         * Either return this.props.data that comes from Pagey or
         * return the altered data from the event stream
         */
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
