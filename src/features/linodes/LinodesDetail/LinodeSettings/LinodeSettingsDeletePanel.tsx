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
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props { linodeId: number; }

interface State { open: boolean; }

type CombinedProps = Props & RouteComponentProps<{}> & WithStyles<ClassNames>;

class LinodeSettingsDeletPanel extends React.Component<CombinedProps, State> {
  state: State = {
    open: false,
  };

  deleteLinode = () => {
    this.setState(set(lensPath(['submitting']), true));
    deleteLinode(this.props.linodeId)
      .then((response) => {
        this.props.history.push('/');
      })
      .catch((error) => {
        this.setState(set(lensPath(['errors']), error.response.data.errors));
      });
  }

  openDeleteDialog = () => {
    this.setState({ open: true });
  }

  render() {
    return (
      <React.Fragment>
        <ExpansionPanel defaultExpanded heading="Delete Linode">
          <Button
            variant="raised"
            color="secondary"
            className="destructive"
            onClick={this.openDeleteDialog}
            style={{ marginBottom: 8 }}
            data-qa-delete-linode
          >
            Delete
          </Button>
          <Typography variant="caption">
            Deleting a Linode will result in permenant data loss.
          </Typography>
        </ExpansionPanel>
        <ConfirmationDialog
          title="Confirm Deletion"
          actions={() =>
            <ActionsPanel style={{ padding: 0 }}>
              <Button
                variant="raised"
                color="secondary"
                className="destructive"
                onClick={this.deleteLinode}
                data-qa-confirm-delete
              >
                Delete
              </Button>
              <Button
                onClick={() => this.setState({ open: false })}
                variant="raised"
                color="secondary"
                className="cancel"
                data-qa-cancel-delete
              >
                Cancel
            </Button>
            </ActionsPanel>
          }
          open={this.state.open}
        >
          Deleting a Linode will result in permenant data loss. Are you sure?
        </ConfirmationDialog>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const errorBoundary = PanelErrorBoundary({ heading: 'Delete Linode' });

export default compose(
  errorBoundary,
  withRouter,
  styled,
)(LinodeSettingsDeletPanel) as React.ComponentType<Props>;
