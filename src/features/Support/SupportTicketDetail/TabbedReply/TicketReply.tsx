import * as React from 'react';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import TextField from 'src/components/TextField';

type ClassNames = 'replyField';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  replyField: {
    '& > div': {
      maxWidth: '100% !important'
    }
  }
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
    const { placeholder, classes, value, handleChange, error } = this.props;

    return (
      <React.Fragment>
        <TextField
          className={classes.replyField}
          multiline
          rows={5}
          value={value}
          placeholder={placeholder || 'Enter your reply'}
          data-qa-ticket-description
          onChange={e => handleChange(e.target.value)}
          errorText={error}
        />
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(TicketReply);
