import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { lensPath, set } from 'ramda';

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
              <Button onClick={() => this.setState({ open: false })}>
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

export default withRouter(styled(LinodeSettingsDeletPanel));
