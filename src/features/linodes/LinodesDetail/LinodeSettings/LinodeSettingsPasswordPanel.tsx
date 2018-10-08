import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';

import { compose } from 'ramda';
import * as React from 'react';
import { Item } from 'src/components/EnhancedSelect/Select';

import ExpansionPanel from 'src/components/ExpansionPanel';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import { LinodeSettingsPasswordResetForm } from 'src/features/linodes/LinodesDetail/LinodeSettings/LinodeSettingsPasswordResetForm';
import { getLinodeDisks } from 'src/services/linodes';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  linodeId: number;
  linodeLabel: string;
  linodeStatus: string;
}

interface State {
  disksLoading: boolean;
  disks: Item[];
  disksError?: string;
  diskId?: number;

  success?: string;
}

type CombinedProps = Props
  & WithStyles<ClassNames>;

class LinodeSettingsPasswordPanel extends React.Component<CombinedProps, State> {

  state: State = {
    disksLoading: true,
    disks: [],
  }

  // Use API method to get disks and set state appropriately
  searchDisks = (value: string = '') => {
    if (this.state.disksLoading === false) {
      this.setState({ disksLoading: true });
    }

    // API Method to get disks
    return getLinodeDisks(this.props.linodeId, {}, { label: { '+contains': value } })
      .then(response => response.data
        // A typical response might include items with a filesystem of "swap" –– what does this mean?
        .filter((disk: Linode.Disk) => disk.filesystem !== 'swap')
        .map(disk => ({ // Is there are interface for this somewhere?
          value: disk.id,
          label: disk.label,
          data: disk,
        })))
      .then(disks => {
        this.setState({ disks, disksLoading: false })
      })
      .catch(error => this.setState({ disksError: 'An error occurred while searching for disks.', disksLoading: false }));
  };

  componentDidMount() {
    this.searchDisks();
  }

  handlePanelChange = (e: React.ChangeEvent<{}>, open: boolean) => {
    if (open) {
      this.searchDisks();
    }
  };

  render() {
    return (
      <ExpansionPanel
        heading="Reset Root Password"
        success={this.state.success}
        onChange={this.handlePanelChange}
      >

       <LinodeSettingsPasswordResetForm
          disks={this.state.disks}
          disksLoading={this.state.disksLoading}
          apiDiskError={this.state.disksError}
          linodeId={this.props.linodeId}
          linodeStatus={this.props.linodeStatus}
          notifySuccess={(successMessage: string) => this.setState({ success: successMessage })}
       />

      </ExpansionPanel>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const errorBoundary = PanelErrorBoundary({ heading: 'Reset Root Password' });

export default compose(
  errorBoundary,
  styled,
)(LinodeSettingsPasswordPanel) as React.ComponentType<Props>;