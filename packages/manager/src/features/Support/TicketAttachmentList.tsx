import InsertDriveFile from '@mui/icons-material/InsertDriveFile';
import InsertPhoto from '@mui/icons-material/InsertPhoto';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { WithStyles, createStyles, withStyles } from '@mui/styles';
import { isEmpty, slice } from 'ramda';
import * as React from 'react';
import { compose, withStateHandlers } from 'recompose';

import { ShowMoreExpansion } from 'src/components/ShowMoreExpansion';
import { Typography } from 'src/components/Typography';

import TicketAttachmentRow from './TicketAttachmentRow';

type ClassNames = 'attachmentPaperWrapper' | 'root';

const styles = (theme: Theme) =>
  createStyles({
    attachmentPaperWrapper: {
      overflowX: 'auto',
    },
    root: {
      marginLeft: theme.spacing(7),
      maxWidth: 600,
      [theme.breakpoints.down('sm')]: {
        marginLeft: theme.spacing(5),
        width: 'calc(100% - 32px)',
      },
    },
  });

interface ToggleProps {
  showMoreAttachments: boolean;
  toggle: (e: React.MouseEvent<HTMLDivElement>) => (t: boolean) => boolean;
}

interface Props {
  attachments: string[];
}

type CombinedProps = Props & ToggleProps & WithStyles<ClassNames>;

export const addIconsToAttachments = (attachments: string[] = []) => {
  const extensions = ['jpg', 'jpeg', 'png', 'bmp', 'tiff'];
  return attachments.map((attachment, idx) => {
    // try to find a file extension
    const lastDotIndex = attachment.lastIndexOf('.');
    const ext = attachment.slice(lastDotIndex + 1);
    if (ext && extensions.includes(ext.toLowerCase())) {
      return <InsertPhoto key={idx} />;
    }
    return <InsertDriveFile key={idx} />;
  });
};

export const TicketAttachmentList: React.FC<CombinedProps> = (props) => {
  const { attachments, classes, showMoreAttachments, toggle } = props;

  if (isEmpty(attachments)) {
    return null;
  }
  // create an array of icons to use
  const icons = addIconsToAttachments(attachments);

  return (
    <Grid className={classes.root} container justifyContent="flex-start">
      <Grid className={classes.attachmentPaperWrapper}>
        <Typography variant="h3">Attachments</Typography>
        <TicketAttachmentRow
          attachments={slice(0, 5, attachments)}
          icons={icons}
        />
        {attachments.length > 5 && (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events
          <div
            data-qa-attachment-toggle
            onClick={toggle}
            role="button"
            style={{ display: 'inline-block' }}
            tabIndex={0}
          >
            <ShowMoreExpansion
              name={
                !showMoreAttachments ? 'Show More Files' : 'Show Less Files'
              }
              defaultExpanded={false}
            >
              <TicketAttachmentRow
                attachments={slice(5, Infinity, attachments)}
                icons={icons}
              />
            </ShowMoreExpansion>
          </div>
        )}
      </Grid>
    </Grid>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  withStateHandlers(
    { showMoreAttachments: false },
    {
      toggle: ({ showMoreAttachments }) => () => ({
        showMoreAttachments: !showMoreAttachments,
      }),
    }
  ),
  styled
)(TicketAttachmentList);

export default enhanced;
