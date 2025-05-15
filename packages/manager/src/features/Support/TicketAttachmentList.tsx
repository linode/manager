import { Typography } from '@linode/ui';
import InsertDriveFile from '@mui/icons-material/InsertDriveFile';
import InsertPhoto from '@mui/icons-material/InsertPhoto';
import Grid from '@mui/material/Grid2';
import { isEmpty, slice } from 'ramda';
import * as React from 'react';

import { ShowMoreExpansion } from 'src/components/ShowMoreExpansion';

import { TicketAttachmentRow } from './TicketAttachmentRow';

interface Props {
  attachments: string[];
}

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

export const TicketAttachmentList = ({ attachments }: Props) => {
  const [showMoreAttachments, setShowMoreAttachments] = React.useState(false);

  const toggle = () => {
    setShowMoreAttachments((prev) => !prev);
  };

  if (isEmpty(attachments)) {
    return null;
  }
  // create an array of icons to use
  const icons = addIconsToAttachments(attachments);

  return (
    <Grid
      container
      sx={[
        {
          justifyContent: 'flex-start',
        },
        (theme) => ({
          marginLeft: theme.spacing(6),
          marginTop: theme.spacing(),
          maxWidth: 600,
          [theme.breakpoints.down('sm')]: {
            marginLeft: theme.spacing(5),
            width: 'calc(100% - 32px)',
          },
        }),
      ]}
    >
      <Grid
        sx={{
          overflowX: 'auto',
        }}
      >
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
              defaultExpanded={false}
              name={
                !showMoreAttachments ? 'Show More Files' : 'Show Less Files'
              }
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
