import { pathOr } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { createReply, SupportReply } from 'src/services/support';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 'root' | 'form';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    width: '100%',
  },
  form: {
    minWidth: '100% !important',
    width: '100vw !important',
  },
});

interface Props {
  ticketId: number;
  onSuccess: (newReply:SupportReply) => void;
}

interface State {
  value: string;
  submitting: boolean;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class TicketReply extends React.Component<CombinedProps, State> {
  state: State = {
    value: '',
    submitting: false,
  }

  handleReplyInput = (e:React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ value: e.target.value });
  }

  submitForm = () => {
    const { onSuccess } = this.props;
    this.setState({ submitting: true });
    createReply({ description: this.state.value, ticket_id: this.props.ticketId })
      .then((response) => {
        onSuccess(response.data);
        this.setState({ submitting: false, value: '' });
      })
      .catch((errors) => {
        const error = [{ 'reason': 'There was an error creating your reply. Please try again.' }];
        this.setState({
          errors: pathOr(error, ['response', 'data', 'errors'], errors),
          submitting: false });
      })
  }

  render() {
    const { classes } = this.props;
    const { errors, submitting, value } = this.state;

    const hasErrorFor = getAPIErrorFor({
      description: 'description',
    }, errors);

    const replyError = hasErrorFor('description');
    const generalError = hasErrorFor('none');

    return (
      <Grid className={classes.root} item>
        <Typography variant="headline" className={classes.root} data-qa-title >
          Reply
        </Typography>
        {generalError && <Notice error spacingBottom={8} spacingTop={8} text={generalError} />}
        <TextField
          multiline
          rows={5}
          value={value}
          placeholder="Enter your reply"
          onChange={this.handleReplyInput}
          errorText={replyError}
        />
        <ActionsPanel style={{ marginTop: 16 }}>
          <Button
            type="primary"
            loading={submitting}
            onClick={this.submitForm}
          >
            Send
          </Button>
        </ActionsPanel>
      </Grid>
    )
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(TicketReply);