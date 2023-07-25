import { WithStyles, createStyles, withStyles } from '@mui/styles';
import * as React from 'react';

import { TextField } from 'src/components/TextField';

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
  placeholder?: string;
  value: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class TicketReply extends React.Component<CombinedProps> {
  render() {
    const { classes, error, handleChange, placeholder, value } = this.props;

    return (
      <TextField
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleChange(e.target.value)
        }
        className={classes.replyField}
        data-qa-ticket-description
        errorText={error}
        hideLabel
        label="Enter your reply"
        multiline
        placeholder={placeholder || 'Enter your reply'}
        rows={1.8}
        value={value}
      />
    );
  }
}

const styled = withStyles(styles);

export default styled(TicketReply);
