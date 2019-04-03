import { compose, take } from 'ramda';
import * as React from 'react';
import { Subscription } from 'rxjs/Subscription';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Table from 'src/components/core/Table';
import TableBody from 'src/components/core/TableBody';

import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { events$ } from 'src/events';
import { getVolumes } from 'src/services/volumes';
import DashboardCard from '../DashboardCard';
import ViewAllLink from '../ViewAllLink';
import VolumeDashboardRow from './VolumeDashboardRow';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});
interface State {
  loading: boolean;
  errors?: Linode.ApiFieldError[];
  data?: Linode.Volume[];
  results?: number;
}

type CombinedProps = WithStyles<ClassNames>;

export class VolumesDashboardCard extends React.Component<
  CombinedProps,
  State
> {
  state: State = {
    loading: true
  };

  mounted: boolean = false;

  subscription: Subscription;

  requestData = (initial: boolean = false) => {
    if (!this.mounted) {
      return;
    }

    if (initial) {
      this.setState({ loading: true });
    }

    getVolumes({ page_size: 25 }, { '+order_by': 'label', '+order': 'asc' })
      .then(({ data, results }) => {
        if (!this.mounted) {
          return;
        }
        this.setState({
          loading: false,
          data: take(5, data),
          results
        });
      })
      .catch(error => {
        this.setState({
          loading: false,
          errors: [{ reason: 'Unable to load Volumes.' }]
        });
      });
  };

  componentDidMount() {
    this.mounted = true;

    this.requestData(true);

    this.subscription = events$
      .filter(e => !e._initial)
      .filter(e => Boolean(e.entity && e.entity.type === 'volume'))
      .filter(
        e =>
          Boolean(this.state.data && this.state.data.length < 5) ||
          isFoundInData(e.entity!.id, this.state.data)
      )
      .subscribe(() => this.requestData(false));
  }

  componentWillUnmount() {
    this.mounted = false;
    this.subscription.unsubscribe();
  }

  render() {
    return (
      <DashboardCard
        title="Volumes"
        headerAction={this.renderAction}
        data-qa-dash-volume
      >
        <Paper>
          <Table>
            <TableBody>{this.renderContent()}</TableBody>
          </Table>
        </Paper>
      </DashboardCard>
    );
  }

  renderAction = () =>
    this.state.results && this.state.results > 5 ? (
      <ViewAllLink
        text="View All"
        link={'/volumes'}
        count={this.state.results}
      />
    ) : null;

  renderContent = () => {
    const { loading, data, errors } = this.state;
    if (loading) {
      return this.renderLoading();
    }

    if (errors) {
      return this.renderErrors(errors);
    }

    if (data && data.length > 0) {
      return data.map((volume, idx) => (
        <VolumeDashboardRow
          key={`volume-dashboard-row-${idx}`}
          volume={volume}
        />
      ));
    }

    return this.renderEmpty();
  };

  renderLoading = () => {
    return <TableRowLoading colSpan={3} />;
  };

  renderErrors = (errors: Linode.ApiFieldError[]) => (
    <TableRowError colSpan={3} message={`Unable to load Volumes.`} />
  );

  renderEmpty = () => <TableRowEmptyState colSpan={2} />;
}

const styled = withStyles(styles);

const enhanced = compose(styled);

const isFoundInData = (id: number, data: Linode.Volume[] = []): boolean =>
  data.reduce((result, volume) => result || volume.id === id, false);

export default enhanced(VolumesDashboardCard) as React.ComponentType<{}>;
