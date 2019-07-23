import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import CopyableTextField from '../CopyableTextField';
import NoticePanel from './NoticePanel';

type ClassNames = 'root' | 'copySection' | 'copyField';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    copySection: {
      marginTop: theme.spacing(2)
    },
    copyField: {
      marginTop: theme.spacing(1)
    }
  });

interface Props {
  volumeLabel: string;
  onClose: () => void;
  message?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ResizeVolumeInstructions: React.StatelessComponent<
  CombinedProps
> = props => {
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
          value={`umount /dev/disk/by-id/scsi-0Linode_Volume_${volumeLabel}`}
          data-qa-umount
        />
      </div>

      <div className={classes.copySection}>
        <Typography variant="body1">
          Assuming you have an ext2, ext3, or ext4 partition, first run a file
          system check, then resize it to fill the new volume size:
        </Typography>
        <CopyableTextField
          className={classes.copyField}
          value={`e2fsck -f /dev/disk/by-id/scsi-0Linode_Volume_${volumeLabel}`}
          data-qa-check-filesystem
        />
        <CopyableTextField
          className={classes.copyField}
          value={`resize2fs /dev/disk/by-id/scsi-0Linode_Volume_${volumeLabel}`}
          data-qa-resize-filesystem
        />
      </div>

      <div className={classes.copySection}>
        <Typography variant="body1">
          Now mount it back onto the filesystem:
        </Typography>
        <CopyableTextField
          className={classes.copyField}
          value={`mount /dev/disk/by-id/scsi-0Linode_Volume_${volumeLabel} /mnt/${volumeLabel}`}
          data-qa-mount
        />
      </div>
      <ActionsPanel>
        <Button onClick={onClose} buttonType="primary">
          Close
        </Button>
      </ActionsPanel>
    </React.Fragment>
  );
};

const styled = withStyles(styles);

export default styled(ResizeVolumeInstructions);
