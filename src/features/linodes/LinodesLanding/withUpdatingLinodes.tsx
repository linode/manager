import { pathSatisfies } from 'ramda';
import * as React from 'react';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/concatMap';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { events$ } from 'src/events';
import { getLinode } from 'src/services/linodes';

interface PropsIn {
  data?: Linode.Linode[];
}

interface State {
  linodeIDs: number[];
  data: Linode.Linode[];
}

const withUpdatingLinodes = (WrappedComponent: React.ComponentType<PropsIn>) => {
  class WithUpdatingLinode extends React.Component<PropsIn, State> {
    state: State = {
      linodeIDs: [],
      data: [],
    }

    subscription: Subscription;

    componentDidMount() {
      this.subscription = events$
        .filter(e =>
          isNotInitialEvent(e)
          && typeIsLinode(e)
          && Boolean(e.entity) && this.state.linodeIDs.includes(e.entity!.id)
          && isWhitelistedAction(e.action)
          && isWhitelistedStatus(e.status)
        )

        .concatMap((event) => Observable.fromPromise(
          getLinode(event.entity!.id)
            .then((response) => response.data)
            .then(linode => ({ ...linode, recentEvent: event }))
        ))

        /** All the filters. */
        .subscribe((updatedLinode) => {
          this.setState({
            data: this.state.data.map((existingLinode) =>
              existingLinode.id === updatedLinode.id
                ? updatedLinode
                : existingLinode)
          })
        }, console.error)
    }

    componentWillUnmount() {
      if (this.subscription.unsubscribe) {
        this.subscription.unsubscribe();
      }
    }

    componentDidUpdate(prevProps: PropsIn) {
      const { data } = this.props;
      const { data: prevData } = prevProps;

      if (
        data && data.length > 0
        && data !== prevData
      ) {
        this.setState({
          linodeIDs: data.map(l => l.id),
          data: this.state.data.length !== 0 ? this.state.data : data,
        });
      }
    }

    render() {
      const { data: originalData, ...rest } = this.props;
      const { data } = this.state;
      return (
        <WrappedComponent data={data} {...rest} />
      );
    }
  }

  return WithUpdatingLinode;
}

export default withUpdatingLinodes;

const isWhitelistedAction = (v: string) => [
  'linode_boot',
  'linode_create', // needed because creating from a backup doesn't auto boot the linode
  'backups_restore',
  'linode_reboot',
  'linode_shutdown',
  'linode_snapshot',
  'linode_rebuild',
  'linode_resize',
  'linode_migrate',
].includes(v);

const isWhitelistedStatus = (v: string) => [
  'started',
  'finished',
  'scheduled',
  'failed',
].includes(v);

const isNotInitialEvent = pathSatisfies((_initial) => !_initial, ['_initial']);

const typeIsLinode = pathSatisfies((type) => type === 'linode', ['entity', 'type']);
