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
  text?: string;
  dangerouslySetInnerHTML?: {
    __html: string;
  };
  open?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const TicketDetailText: React.FC<CombinedProps> = props => {
  const [panelOpen, togglePanel] = React.useState<boolean>(props.open || true);
  const { text, classes, dangerouslySetInnerHTML } = props;

  if (!!text && !!dangerouslySetInnerHTML) {
    throw new Error(
      'The "text" and "html" props are mutually exclusive. Please choose only one'
    );
  }

  const ticketBody =
    !text && !dangerouslySetInnerHTML
      ? ''
      : !!text
      ? text
      : /** at this point we've handled for the cases where dangerouslySetInnerHTML doesn't exist */
        dangerouslySetInnerHTML!.__html;

  const truncatedText = truncateText(ticketBody, 175);
  const ticketReplyBody = panelOpen ? ticketBody : truncatedText;

  return (
    <React.Fragment>
      <Grid
        item
        xs={truncatedText !== ticketBody ? 11 : 12}
        sm={truncatedText !== ticketBody ? 6 : 7}
        md={truncatedText !== ticketBody ? 8 : 9}
      >
        {props.text ? (
          <Typography className={classes.formattedText}>
            {ticketReplyBody}
          </Typography>
        ) : (
          <Typography
            className={classes.formattedText}
            dangerouslySetInnerHTML={{
              __html: ticketReplyBody
            }}
          />
        )}
      </Grid>
      {truncatedText !== ticketBody && (
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
            {panelOpen ? (
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
  React.memo,
  styled
)(TicketDetailText);
