import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import HighlightedMarkdown from 'src/components/HighlightedMarkdown';
import IconButton from 'src/components/IconButton';
import truncateText from 'src/utilities/truncateText';

const useStyles = makeStyles((theme: Theme) => ({
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
      stroke: theme.cmrTextColors.tableHeader
    }
  },
  toggle: {
    height: 22,
    width: 22
  },
  expand: {
    transform: 'rotate(180deg)'
  }
}));

interface Props {
  text: string;
  open?: boolean;
}

const TicketDetailText: React.FC<Props> = props => {
  const classes = useStyles();

  const [panelOpen, togglePanel] = React.useState<boolean>(props.open || true);
  const { text } = props;

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
            <KeyboardArrowDown className={classes.toggle} />
          ) : (
            <KeyboardArrowDown
              className={`${classes.toggle} ${classes.expand}`}
            />
          )}
        </IconButton>
      )}
    </Grid>
  );
};

export default React.memo(TicketDetailText);
