import * as React from 'react';

import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

import Grid from 'src/components/Grid';

type ClassNames =
  | 'root'
  | 'attachmentPaper'
  | 'attachmentRow'
  | 'attachmentIcon';

const styles = (theme: Theme) =>
  createStyles({
  root: {},
  attachmentPaper: {
    padding: `
      ${theme.spacing(1) + theme.spacing(1) / 2}px
      ${theme.spacing(3)}px
      0
    `,
    overflowX: 'auto',
    width: 500
  },
  attachmentRow: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: 12,
    '&:last-child': {
      marginBottom: 0,
      border: 0
    }
  },
  attachmentIcon: {
    paddingLeft: `0 !important`,
    color: theme.palette.text.primary
  }
});

interface Props {
  attachments: string[];
  icons: JSX.Element[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const TicketAttachmentRow: React.StatelessComponent<
  CombinedProps
> = props => {
  const { attachments, classes, icons } = props;
  return (
    <Paper className={classes.attachmentPaper}>
      {attachments.map((attachment, idx) => {
        return (
          <Grid
            container
            wrap="nowrap"
            key={idx}
            className={classes.attachmentRow}
            data-qa-attachment-row
          >
            <Grid item className={classes.attachmentIcon}>
              {icons[idx]}
            </Grid>
            <Grid item>
              <Typography component="span">{attachment}</Typography>
            </Grid>
          </Grid>
        );
      })}
    </Paper>
  );
};

TicketAttachmentRow.displayName = 'TicketAttachmentRow';

const styled = withStyles(styles);

export default styled(TicketAttachmentRow);
