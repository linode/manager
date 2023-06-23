import * as React from 'react';
import { createStyles, withStyles, WithStyles } from '@mui/styles';
import TextField from 'src/components/TextField';

type ClassNames = 'replyField';

const styles = () =>
  createStyles({
    replyField: {
      '& > div': {
        maxWidth: '100% !important',
      },
      marginTop: 0,
    },
  });

export interface Props {
  error?: string;
  handleChange: (value: string) => void;
  value: string;
  placeholder?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class TicketReply extends React.Component<CombinedProps> {
  render() {
    const { classes, error, handleChange, placeholder, value } = this.props;

    return (
      <TextField
        className={classes.replyField}
        multiline
        rows={1.8}
        value={value}
        placeholder={placeholder || 'Enter your reply'}
        data-qa-ticket-description
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleChange(e.target.value)
        }
        errorText={error}
        label="Enter your reply"
        hideLabel
      />
    );
  }
}

const styled = withStyles(styles);

export default styled(TicketReply);
