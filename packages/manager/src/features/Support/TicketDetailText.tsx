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
import HighlightedMarkdown from 'src/components/HighlightedMarkdown';
import IconButton from 'src/components/IconButton';

import truncateText from 'src/utilities/truncateText';

type ClassNames = 'root' | 'expButton' | 'toggle' | 'buttonText';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginTop: theme.spacing(1),
      padding: `${theme.spacing(2)}px ${theme.spacing(1)}px`,
      position: 'relative',
      '& pre': {
        backgroundColor: theme.bg.tableHeader
      }
    },
    expButton: {
      position: 'absolute',
      top: -43,
      right: 0,
      left: 'auto',
      '& svg': {
        stroke: theme.color.grey1
      },
      '& .border': {
        stroke: theme.color.grey1,
        fill: theme.color.white
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
      color: theme.palette.primary.main,
      [theme.breakpoints.down('sm')]: {
        visibility: 'hidden'
      }
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

  const truncatedText = truncateText(text, 175);
  const ticketReplyBody = panelOpen ? text : truncatedText;

  return (
    <Grid container className={classes.root}>
      <Grid item style={{ width: '100%' }}>
        <HighlightedMarkdown textOrMarkdown={ticketReplyBody} />
      </Grid>
      {truncatedText !== text && (
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
