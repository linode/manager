import { closeSupportTicket } from 'linode-js-sdk/lib/support';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import scrollTo from 'src/utilities/scrollTo';

type ClassNames = 'closeLink';

const styles = (theme: Theme) =>
  createStyles({
    closeLink: {
      background: 'none',
      color: theme.palette.primary.main,
      border: 'none',
      padding: 0,
      font: 'inherit',
      cursor: 'pointer',
      '&:hover': {
        textDecoration: 'underline'
      }
    }
  });

interface Props {
  ticketId: number;
  closeTicketSuccess: () => void;
}

interface State {
  dialogOpen: boolean;
  isClosingTicket: boolean;
  ticketCloseError?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class CloseTicketLink extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  state: State = {
    dialogOpen: false,
    isClosingTicket: false
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  openConfirmationDialog = () => {
    if (!this.mounted) {
      return;
    }
    this.setState({
      dialogOpen: true,
      isClosingTicket: false,
      ticketCloseError: undefined
    });
  };

  closeConfirmationDialog = () => {
    if (!this.mounted) {
      return;
    }
    this.setState({ dialogOpen: false });
  };

  onClose = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    this.closeTicket();
  };

  closeTicket = () => {
    const { closeTicketSuccess, ticketId } = this.props;
    if (this.mounted) {
      this.setState({ isClosingTicket: true });
    }
    closeSupportTicket(ticketId)
      .then(() => {
        if (this.mounted) {
          this.setState({ isClosingTicket: false, dialogOpen: false });
          scrollTo();
        }
        closeTicketSuccess();
      })
      .catch(errorResponse => {
        const apiError = getErrorStringOrDefault(
          errorResponse,
          'Ticket could not be closed.'
        );
        if (!this.mounted) {
          return;
        }
        this.setState({
          isClosingTicket: false,
          ticketCloseError: apiError
        });
      });
  };

  dialogActions = () => {
    return (
      <ActionsPanel>
        <Button
          buttonType="cancel"
          onClick={this.closeConfirmationDialog}
          data-qa-dialog-cancel
        >
          Cancel
        </Button>
        <Button
          buttonType="primary"
          loading={this.state.isClosingTicket}
          onClick={this.onClose}
          data-qa-dialog-submit
        >
          Confirm
        </Button>
      </ActionsPanel>
    );
  };

  render() {
    const { ticketCloseError } = this.state;
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Typography>
          {`If everything is resolved, you can `}
          <button
            onClick={this.openConfirmationDialog}
            type="button"
            title="Close this ticket"
            className={classes.closeLink}
            data-qa-close-ticket-link
          >
            close this ticket
          </button>
          .
        </Typography>
        <ConfirmationDialog
          open={this.state.dialogOpen}
          title={`Confirm Ticket Close`}
          onClose={this.closeConfirmationDialog}
          actions={this.dialogActions}
        >
          {ticketCloseError && (
            <Notice error text={ticketCloseError} data-qa-confirmation-error />
          )}
          <Typography>
            {`Are you sure you want to close this ticket?`}
          </Typography>
        </ConfirmationDialog>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(CloseTicketLink);
