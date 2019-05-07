import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/core/styles';
import * as React from 'react';
import { compose } from 'recompose';

import Collapse from 'src/assets/icons/minus-square.svg';
import Expand from 'src/assets/icons/plus-square.svg';

import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import IconButton from 'src/components/IconButton';

import { sanitizeHTML } from 'src/utilities/sanitize-html';
import truncateText from 'src/utilities/truncateText';

type ClassNames = 'root' | 'formattedText' | 'expCol' | 'expButton' | 'toggle';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  expCol: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  expButton: {
    position: 'relative',
    top: -theme.spacing.unit,
    left: theme.spacing.unit,
    [theme.breakpoints.down('sm')]: {
      position: 'absolute',
      top: 16,
      right: 16,
      left: 'auto'
    }
  },
  toggle: {
    height: 24,
    width: 24
  },
  formattedText: {
    whiteSpace: 'pre-line'
  }
});

interface Props {
  text: string;
  open?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const TicketDetailText: React.FC<CombinedProps> = props => {
  const [panelOpen, togglePanel] = React.useState<boolean>(props.open || true);
  const { text, classes } = props;

  /** get rid of malicious HTML */
  const sanitizedText = sanitizeHTML(text);

  const truncatedText = truncateText(sanitizedText, 175);
  const ticketReplyBody = open ? sanitizedText : truncatedText;

  return (
    <React.Fragment>
      <Grid
        item
        xs={truncatedText !== sanitizedText ? 11 : 12}
        sm={truncatedText !== sanitizedText ? 6 : 7}
        md={truncatedText !== sanitizedText ? 8 : 9}
      >
        <Typography
          className={classes.formattedText}
          dangerouslySetInnerHTML={{
            __html: ticketReplyBody
          }}
        />
      </Grid>
      {truncatedText !== sanitizedText && (
        <Grid
          item
          xs={1}
          onClick={() => togglePanel(!panelOpen)}
          className={classes.expCol}
        >
          <IconButton
            className={classes.expButton}
            aria-label="Expand full answer"
          >
            {open ? (
              <Collapse className={classes.toggle} />
            ) : (
              <Expand className={classes.toggle} />
            )}
          </IconButton>
        </Grid>
      )}
    </React.Fragment>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default compose<CombinedProps, Props>(
  styled,
  React.memo
)(TicketDetailText);
