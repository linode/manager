import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { compose, lensPath, set } from 'ramda';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
  Typography,
} from 'material-ui';
import Button from 'material-ui/Button';

import { deleteLinode } from 'src/services/linodes';
import ExpansionPanel from 'src/components/ExpansionPanel';
import ActionsPanel from 'src/components/ActionsPanel';
import ConfirmationDialog from 'src/components/ConfirmationDialog';

import LinodeSettingsLabelPanel from './LinodeSettingsLabelPanel';
import LinodeSettingsPasswordPanel from './LinodeSettingsPasswordPanel';
import LinodeSettingsAlertsPanel from './LinodeSettingsAlertsPanel';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
});

interface Props {
  linodeId: number;
  linodeLabel: string;
  alerts: Linode.LinodeAlerts;
}

interface DeleteDialog {
  open: boolean;
}

interface State {
  linodeLabel: string;
  alerts: Linode.LinodeAlerts;
  deleteDialog: DeleteDialog;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props
  & RouteComponentProps<{}>
  & WithStyles<ClassNames>;

class LinodeSettings extends React.Component<CombinedProps, State> {
  state: State = {
    linodeLabel: this.props.linodeLabel,
    alerts: this.props.alerts,
    deleteDialog: {
      open: false,
    },
  };


  deleteLinode = () => {
    this.setState(set(lensPath(['deleteForm', 'submitting']), true));
    deleteLinode(this.props.linodeId)
      .then((response) => {
        this.props.history.push('/');
      })
      .catch((error) => {
        this.setState(set(lensPath(['errors']), error.response.data.errors));
      });
  }

  openDeleteDialog = () => {
    this.setState({ deleteDialog: { open: true } });
  }

  componentWillReceiveProps(nextProps: CombinedProps) {
    if (nextProps.linodeLabel !== this.state.linodeLabel) {
      this.setState(compose(
        set(lensPath(['linodeLabel']), nextProps.linodeLabel),
      ));
    }

    if (nextProps.alerts !== this.state.alerts) {
      this.setState(compose(
        set(lensPath(['alerts']), nextProps.alerts),
      ));
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <Typography variant="headline" className={classes.title}>Settings</Typography>
        <LinodeSettingsLabelPanel
          linodeLabel={this.state.linodeLabel}
          linodeId={this.props.linodeId}
        />
        <LinodeSettingsPasswordPanel
          linodeLabel={this.state.linodeLabel}
          linodeId={this.props.linodeId}
        />
        <LinodeSettingsAlertsPanel
          linodeId={this.props.linodeId}
          linodeLabel={this.state.linodeLabel}
          linodeAlerts={this.state.alerts}
        />
        <ExpansionPanel defaultExpanded heading="Shutdown Watchdog"></ExpansionPanel>
        <ExpansionPanel defaultExpanded heading="Advanced Configurations"></ExpansionPanel>
        <ExpansionPanel defaultExpanded heading="Delete Linode">
          <Typography>Deleting a Linode will result in permenant data loss.</Typography>
          <Button
            variant="raised"
            color="secondary"
            className="destructive"
            onClick={this.openDeleteDialog}
          >
            Delete
          </Button>
        </ExpansionPanel>
        <ConfirmationDialog
          title="Confirm Deletion"
          actions={() =>
            <ActionsPanel>
              <Button
                variant="raised"
                color="secondary"
                className="destructive"
                onClick={this.deleteLinode}
              >
                Delete
          </Button>
              <Button onClick={() => this.setState({ deleteDialog: { open: false } })}>
                Cancel
              </Button>
            </ActionsPanel>
          }
          open={this.state.deleteDialog.open}
        >
          Deleting a Linode will result in permenant data loss. Are you sure?
        </ConfirmationDialog>
      </React.Fragment >
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose<any, any, any>(
  withRouter,
  styled,
)(LinodeSettings);
