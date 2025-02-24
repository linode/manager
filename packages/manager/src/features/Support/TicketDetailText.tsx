import { IconButton } from '@linode/ui';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Grid from '@mui/material/Grid2';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Markdown } from 'src/components/Markdown/Markdown';
import { truncate } from 'src/utilities/truncate';

import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
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
  const { classes } = useStyles();

  const [panelOpen, togglePanel] = React.useState<boolean>(props.open || true);
  const { text } = props;

  const truncatedText = truncate(text, 175);
  const ticketReplyBody = panelOpen ? text : truncatedText;

  return (
    <Grid className={classes.root} container spacing={2}>
      <Grid style={{ width: '100%' }}>
        <Markdown textOrMarkdown={ticketReplyBody} />
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
