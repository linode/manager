import { pathOr } from 'ramda';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import { closeSupportTicket } from 'src/services/support';
import scrollToTop from 'src/utilities/scrollToTop';

interface Props {
  ticketId: number;
  closeTicketSuccess: () => void;
}

interface State {
  dialogOpen: boolean;
  isClosingTicket: boolean;
  ticketCloseError?: string;
}

type CombinedProps = Props;

class CloseTicketLink extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  state: State = {
    dialogOpen: false,
    isClosingTicket: false,
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  openConfirmationDialog = () => {
    if (!this.mounted) { return; }
    this.setState({ dialogOpen: true, isClosingTicket: false, ticketCloseError: undefined, });
  }

  closeConfirmationDialog = () => {
    if (!this.mounted) { return; }
    this.setState({ dialogOpen: false });
  }

  onClose = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    this.closeTicket();
  }

  closeTicket = () => {
    const { closeTicketSuccess, ticketId } = this.props;
    if (this.mounted) { this.setState({ isClosingTicket: true }); }
    closeSupportTicket(ticketId)
      .then(() => {
        if (this.mounted) { 
          this.setState({ isClosingTicket: false, dialogOpen: false });
          scrollToTop();
        }
        closeTicketSuccess();
    })
      .catch((errorResponse) => {
        const defaultError = [{'reason': 'Your ticket could not be closed.'}];
        const errors = pathOr(defaultError, ['response', 'data', 'errors'], errorResponse);
        if (!this.mounted) { return; }
        this.setState({
          isClosingTicket: false,
          ticketCloseError: errors[0].reason,
        });
    })
  }

  dialogActions = () => {
    return (
      <ActionsPanel>
        <Button
          type="cancel"
          onClick={this.closeConfirmationDialog}
          data-qa-dialog-cancel>
          Cancel
        </Button>
        <Button
          type="secondary"
          loading={this.state.isClosingTicket}
          onClick={this.onClose}
          data-qa-dialog-submit>
          Confirm
        </Button>
      </ActionsPanel>
    )
  }

  render() {
    const { ticketCloseError } = this.state;
    return (
      <React.Fragment>
        <Typography>{`If everything is resolved, you can `} 
            <a onClick={this.openConfirmationDialog} data-qa-close-ticket-link >close this ticket</a>.
        </Typography>
        <ConfirmationDialog
          open={this.state.dialogOpen}
          title={`Confirm Ticket Close`}
          onClose={this.closeConfirmationDialog}
          actions={this.dialogActions}
        >
          {ticketCloseError && <Notice error text={ticketCloseError} data-qa-confirmation-error />}
          <Typography>
            {`Are you sure you want to close this ticket?`}
          </Typography>
        </ConfirmationDialog>
      </React.Fragment>
    );
  }
}


export default CloseTicketLink;
