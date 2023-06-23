import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { createStyles, withStyles, WithStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';

import Grid from '@mui/material/Unstable_Grid2';

type ClassNames =
  | 'root'
  | 'attachmentPaper'
  | 'attachmentRow'
  | 'attachmentIcon';

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
              container
              wrap="nowrap"
              key={idx}
              className={classes.attachmentRow}
              data-qa-attachment-row
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
