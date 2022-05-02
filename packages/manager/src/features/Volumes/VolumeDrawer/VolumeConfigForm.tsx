import * as React from 'react';
import CopyableTextField from 'src/components/CopyableTextField';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import NoticePanel from './NoticePanel';

type ClassNames = 'root' | 'copySection' | 'copyField';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    copySection: {
      marginTop: theme.spacing(3),
    },
    copyField: {
      marginTop: theme.spacing(1) / 2,
    },
  });

interface Props {
  volumePath: string;
  volumeLabel: string;
  onClose: () => void;
  message?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const VolumeConfigDrawer: React.FC<CombinedProps> = (props) => {
  const { classes, message } = props;

  return (
    <React.Fragment>
      {message && <NoticePanel success={message} />}

      <div className={classes.copySection}>
        <Typography variant="body1" data-qa-config-help-msg>
          To get started with a new volume, you&rsquo;ll want to create a
          filesystem on it:
        </Typography>
        <CopyableTextField
          className={classes.copyField}
          value={`mkfs.ext4 "${props.volumePath}"`}
          data-qa-make-filesystem
          label="Create a Filesystem"
          hideLabel
        />
      </div>

      <div className={classes.copySection}>
        <Typography variant="body1" data-qa-config-help-msg>
          Once the volume has a filesystem, you can create a mountpoint for it:
        </Typography>
        <CopyableTextField
          className={classes.copyField}
          value={`mkdir "/mnt/${props.volumeLabel}"`}
          data-qa-mountpoint
          label="Create a Mountpoint"
          hideLabel
        />
      </div>

      <div className={classes.copySection}>
        <Typography variant="body1" data-qa-config-help-msg>
          Then you can mount the new volume:
        </Typography>
        <CopyableTextField
          className={classes.copyField}
          value={`mount "${props.volumePath}" "/mnt/${props.volumeLabel}"`}
          data-qa-mount
          label="Mount Volume"
          hideLabel
        />
      </div>

      <div className={classes.copySection}>
        <Typography variant="body1" data-qa-config-help-msg>
          If you want the volume to automatically mount every time your Linode
          boots, you&rsquo;ll want to add a line like the following to your
          /etc/fstab file:
        </Typography>
        <CopyableTextField
          className={classes.copyField}
          value={`${props.volumePath} /mnt/${props.volumeLabel} ext4 defaults,noatime,nofail 0 2`}
          data-qa-boot-mount
          label="Mount every time your Linode boots"
          hideLabel
        />
      </div>
    </React.Fragment>
  );
};

const styled = withStyles(styles);

export default styled(VolumeConfigDrawer);
