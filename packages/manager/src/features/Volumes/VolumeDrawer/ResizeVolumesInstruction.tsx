import { Theme } from '@mui/material/styles';
import { WithStyles, createStyles, withStyles } from '@mui/styles';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { CopyableTextField } from 'src/components/CopyableTextField/CopyableTextField';
import { Typography } from 'src/components/Typography';

import NoticePanel from './NoticePanel';

type ClassNames = 'copyField' | 'copySection' | 'root';

const styles = (theme: Theme) =>
  createStyles({
    copyField: {
      marginTop: theme.spacing(1),
    },
    copySection: {
      marginTop: theme.spacing(2),
    },
    root: {},
  });

interface Props {
  message?: string;
  onClose: () => void;
  volumeLabel: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ResizeVolumeInstructions: React.FC<CombinedProps> = (props) => {
  const { classes, message, onClose, volumeLabel } = props;

  return (
    <React.Fragment>
      {message && <NoticePanel success={message} />}

      <div className={classes.copySection}>
        <Typography variant="body1">
          After the volume resize is complete, you'll need to restart your
          Linode for the changes to take effect.
        </Typography>
        <Typography variant="body1">
          Once your Linode has restarted, make sure the volume is unmounted for
          safety:
        </Typography>
        <CopyableTextField
          className={classes.copyField}
          data-qa-umount
          hideLabel
          label="Make sure the volume is unmounted for safety"
          value={`umount /dev/disk/by-id/scsi-0Linode_Volume_${volumeLabel}`}
        />
      </div>

      <div className={classes.copySection}>
        <Typography variant="body1">
          Assuming you have an ext2, ext3, or ext4 partition, first run a file
          system check, then resize it to fill the new volume size:
        </Typography>
        <CopyableTextField
          className={classes.copyField}
          data-qa-check-filesystem
          hideLabel
          label="Run a file system check"
          value={`e2fsck -f /dev/disk/by-id/scsi-0Linode_Volume_${volumeLabel}`}
        />
        <CopyableTextField
          className={classes.copyField}
          data-qa-resize-filesystem
          hideLabel
          label="Resize file system to fill the new volume"
          value={`resize2fs /dev/disk/by-id/scsi-0Linode_Volume_${volumeLabel}`}
        />
      </div>

      <div className={classes.copySection}>
        <Typography variant="body1">
          Now mount it back onto the filesystem:
        </Typography>
        <CopyableTextField
          className={classes.copyField}
          data-qa-mount
          hideLabel
          label="Mount back onto the filesystem"
          value={`mount /dev/disk/by-id/scsi-0Linode_Volume_${volumeLabel} /mnt/${volumeLabel}`}
        />
      </div>
      <ActionsPanel primaryButtonProps={{ label: 'Close', onClick: onClose }} />
    </React.Fragment>
  );
};

const styled = withStyles(styles);

export default styled(ResizeVolumeInstructions);
