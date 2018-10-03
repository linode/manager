import { compose, lensPath, set } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';


import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import ExpansionPanel from 'src/components/ExpansionPanel';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import { deleteLinode } from 'src/services/linodes';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props { linodeId: number; }

interface State { open: boolean; }

type CombinedProps = Props & RouteComponentProps<{}> & WithStyles<ClassNames>;

class LinodeSettingsDeletePanel extends React.Component<CombinedProps, State> {
  state: State = {
    open: false,
  };

  deleteLinode = () => {
    this.setState(set(lensPath(['submitting']), true));
    deleteLinode(this.props.linodeId)
      .then((response) => {
        this.props.history.push('/linodes');
      })
      .catch((error) => {
        this.setState(set(lensPath(['errors']), error.response.data.errors), () => {
          scrollErrorIntoView();
        });
      });
  }

  openDeleteDialog = () => {
    this.setState({ open: true });
  }

  closeDeleteDialog = () => {
    this.setState({ open: false });
  }

  render() {
    return (
      <React.Fragment>
        <ExpansionPanel heading="Delete Linode">
          <Button
            type="secondary"
            destructive
            style={{ marginBottom: 8 }}
            onClick={this.openDeleteDialog}
            data-qa-delete-linode
          >
            Delete
          </Button>
          <Typography variant="caption">
            Deleting a Linode will result in permanent data loss.
          </Typography>
        </ExpansionPanel>
        <ConfirmationDialog
          title="Confirm Deletion"
          actions={this.renderConfirmationActions}
          open={this.state.open}
          onClose={this.closeDeleteDialog}
        >
          <Typography>Deleting a Linode will result in permanent data loss. Are you sure?</Typography>
        </ConfirmationDialog>
      </React.Fragment>
    );
  }

  renderConfirmationActions = () => (
    <ActionsPanel style={{ padding: 0 }}>
      <Button type="cancel" onClick={this.closeDeleteDialog} data-qa-cancel-delete>
        Cancel
      </Button>
      <Button type="secondary" destructive onClick={this.deleteLinode} data-qa-confirm-delete>
        Delete
      </Button>
    </ActionsPanel>
  );

}

const styled = withStyles(styles, { withTheme: true });

const errorBoundary = PanelErrorBoundary({ heading: 'Delete Linode' });

export default compose(
  errorBoundary,
  withRouter,
  styled,
)(LinodeSettingsDeletePanel) as React.ComponentType<Props>;
