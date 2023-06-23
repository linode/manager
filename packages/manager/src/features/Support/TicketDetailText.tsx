import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { Theme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { makeStyles } from '@mui/styles';
import * as React from 'react';
import { HighlightedMarkdown } from 'src/components/HighlightedMarkdown/HighlightedMarkdown';
import { IconButton } from 'src/components/IconButton';
import { truncate } from 'src/utilities/truncate';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(1),
    padding: `${theme.spacing(2)} ${theme.spacing(1)}`,
    position: 'relative',
    '& pre': {
      backgroundColor: theme.bg.tableHeader,
    },
  },
  expButton: {
    position: 'absolute',
    top: -43,
    right: 0,
    left: 'auto',
    '& svg': {
      stroke: theme.textColors.tableHeader,
    },
  },
  toggle: {
    height: 22,
    width: 22,
  },
  expand: {
    transform: 'rotate(180deg)',
  },
}));

interface Props {
  text: string;
  open?: boolean;
}

const TicketDetailText: React.FC<Props> = (props) => {
  const classes = useStyles();

  const [panelOpen, togglePanel] = React.useState<boolean>(props.open || true);
  const { text } = props;

  const truncatedText = truncate(text, 175);
  const ticketReplyBody = panelOpen ? text : truncatedText;

  return (
    <Grid container className={classes.root} spacing={2}>
      <Grid style={{ width: '100%' }}>
        <HighlightedMarkdown textOrMarkdown={ticketReplyBody} />
      </Grid>
      {truncatedText !== text && (
        <IconButton
          className={classes.expButton}
          aria-label="Expand full answer"
          onClick={() => togglePanel(!panelOpen)}
          size="large"
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
