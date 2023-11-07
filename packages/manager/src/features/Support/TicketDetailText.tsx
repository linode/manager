import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { HighlightedMarkdown } from 'src/components/HighlightedMarkdown/HighlightedMarkdown';
import { IconButton } from 'src/components/IconButton';
import { truncate } from 'src/utilities/truncate';

const useStyles = makeStyles((theme: Theme) => ({
  expButton: {
    '& svg': {
      stroke: theme.textColors.tableHeader,
    },
    left: 'auto',
    position: 'absolute',
    right: 4,
    top: -35,
  },
  expand: {
    transform: 'rotate(180deg)',
  },
  root: {
    '& pre': {
      backgroundColor: theme.bg.tableHeader,
    },
    padding: `${theme.spacing(2)} ${theme.spacing(2)}`,
    position: 'relative',
  },
  toggle: {
    height: 22,
    width: 22,
  },
}));

interface Props {
  open?: boolean;
  text: string;
}

export const TicketDetailText = (props: Props) => {
  const classes = useStyles();

  const [panelOpen, togglePanel] = React.useState<boolean>(props.open || true);
  const { text } = props;

  const truncatedText = truncate(text, 175);
  const ticketReplyBody = panelOpen ? text : truncatedText;

  return (
    <Grid className={classes.root} container spacing={2}>
      <Grid style={{ width: '100%' }}>
        <HighlightedMarkdown textOrMarkdown={ticketReplyBody} />
      </Grid>
      {truncatedText !== text && (
        <IconButton
          aria-label="Expand full answer"
          className={classes.expButton}
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
