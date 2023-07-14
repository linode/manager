import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { WithStyles, createStyles, withStyles } from '@mui/styles';
import * as React from 'react';

import { Typography } from 'src/components/Typography';
import Paper from 'src/components/core/Paper';

type ClassNames =
  | 'attachmentIcon'
  | 'attachmentPaper'
  | 'attachmentRow'
  | 'root';

const styles = (theme: Theme) =>
  createStyles({
    attachmentIcon: {
      color: theme.palette.text.primary,
      paddingLeft: `0 !important`,
    },
    attachmentPaper: {
      border: `1px solid ${theme.color.grey2}`,
      marginTop: 4,
      overflowX: 'auto',
      padding: `${theme.spacing(1.5)} ${theme.spacing(3)} 0`,
    },
    attachmentRow: {
      '&:last-child': {
        border: 0,
        marginBottom: 0,
      },
      borderBottom: `1px solid ${theme.palette.divider}`,
      marginBottom: 12,
    },
    root: {},
  });

interface Props {
  attachments: string[];
  icons: JSX.Element[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const TicketAttachmentRow: React.FC<CombinedProps> = (props) => {
  const { attachments, classes, icons } = props;
  return (
    <Grid>
      <Paper className={classes.attachmentPaper}>
        {attachments.map((attachment, idx) => {
          return (
            <Grid
              className={classes.attachmentRow}
              container
              data-qa-attachment-row
              key={idx}
              wrap="nowrap"
            >
              <Grid className={classes.attachmentIcon}>{icons[idx]}</Grid>
              <Grid>
                <Typography component="span">{attachment}</Typography>
              </Grid>
            </Grid>
          );
        })}
      </Paper>
    </Grid>
  );
};

TicketAttachmentRow.displayName = 'TicketAttachmentRow';

const styled = withStyles(styles);

export default styled(TicketAttachmentRow);
