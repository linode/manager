import * as React from 'react';
import { compose } from 'recompose';
import Collapse from 'src/assets/icons/minus-square.svg';
import Expand from 'src/assets/icons/plus-square.svg';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import IconButton from 'src/components/IconButton';

import truncateText from 'src/utilities/truncateText';

import './formatted-text.css';

type ClassNames = 'root' | 'expButton' | 'toggle' | 'buttonText';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginTop: theme.spacing(1),
      padding: `${theme.spacing(2)}px ${theme.spacing(1)}px`,
      position: 'relative'
    },
    expButton: {
      position: 'absolute',
      top: -41,
      right: 0,
      left: 'auto',
      '& svg': {
        stroke: theme.color.grey1
      },
      '& .border': {
        stroke: theme.color.grey1,
        fill: 'white'
      }
    },
    toggle: {
      height: 24,
      width: 24
    },
    buttonText: {
      position: 'relative',
      top: -1,
      marginRight: 4,
      color: theme.palette.primary.main
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
    <Grid container className={classes.root}>
      <Grid item style={{ width: '100%' }}>
        {props.text ? (
          <Typography className="formatted-text" component="div">
            {ticketReplyBody}
          </Typography>
        ) : (
          <Typography
            className="formatted-text"
            component="div"
            dangerouslySetInnerHTML={{
              __html: ticketReplyBody
            }}
          />
        )}
      </Grid>
      {truncatedText !== ticketBody && (
        <IconButton
          className={classes.expButton}
          aria-label="Expand full answer"
          onClick={() => togglePanel(!panelOpen)}
        >
          {panelOpen ? (
            <>
              <Typography component="span" className={classes.buttonText}>
                Collapse
              </Typography>
              <Collapse className={classes.toggle} />
            </>
          ) : (
            <>
              <Typography component="span" className={classes.buttonText}>
                Expand
              </Typography>
              <Expand className={classes.toggle} />
            </>
          )}
        </IconButton>
      )}
    </Grid>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default compose<CombinedProps, Props>(
  React.memo,
  styled
)(TicketDetailText);
