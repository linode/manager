import { slice } from 'ramda';
import * as React from 'react';
import { compose, withHandlers, withState } from 'recompose';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import InsertDriveFile from '@material-ui/icons/InsertDriveFile';
import InsertPhoto from '@material-ui/icons/InsertPhoto';

import Grid from 'src/components/Grid';
import ShowMoreExpansion from 'src/components/ShowMoreExpansion';

import TicketAttachmentRow from './TicketAttachmentRow';

type ClassNames = 'root' | 'attachmentPaperWrapper';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  attachmentPaperWrapper: {
    overflowX: 'auto',
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

const TicketAttachmentList: React.StatelessComponent<CombinedProps> = (props) => {
  const { attachments, classes, showMoreAttachments, toggle } = props;

  // create an array of icons to use
  const icons = attachments.map((attachment, idx) => {
    // try to find a file extension
    const lastDotIndex = attachment.lastIndexOf('.');
    const ext = attachment.slice(lastDotIndex + 1);
    if (ext) {
      if (['jpg', 'jpeg', 'png', 'bmp', 'tiff'].includes(ext.toLowerCase())) {
        return <InsertPhoto key={idx} />;
      }
    }
    return <InsertDriveFile key={idx} />;
  })
  return (
    <React.Fragment>
      {attachments.length !== 0 &&
        <Grid item xs={12} container justify="flex-start" className="px0">
          <Grid item xs={12}>
            <Typography variant="subheading">Attachments</Typography>
          </Grid>
          <Grid item xs={12} className={classes.attachmentPaperWrapper}>
            <TicketAttachmentRow attachments={slice(0, 5, attachments)} icons={icons} />
            {
              (attachments.length > 5) &&
              <div onClick={toggle} style={{ display: 'inline-block' }}>
                <ShowMoreExpansion
                  name={!showMoreAttachments
                    ? "Show More Files"
                    : "Show Less Files"
                  }
                >
                  <TicketAttachmentRow attachments={slice(5, Infinity, attachments)} icons={icons} />
                </ShowMoreExpansion>
              </div>
            }
          </Grid>
        </Grid>
      }
    </React.Fragment>
  )
};

const styled = withStyles(styles, { withTheme: true });

const enhanced = compose<CombinedProps, Props>(
  styled,
  withState('showMoreAttachments', 'toggle', false),
  withHandlers({
    toggle: ({ toggle }) => (e: React.MouseEvent<HTMLButtonElement>) => toggle((current: boolean) => !current)
  })
)(TicketAttachmentList);

export default enhanced;
