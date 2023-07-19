import { Theme } from '@mui/material/styles';
import { WithStyles, createStyles, withStyles } from '@mui/styles';
import * as React from 'react';

import { CopyableTextField } from 'src/components/CopyableTextField/CopyableTextField';
import { Typography } from 'src/components/Typography';

import NoticePanel from './NoticePanel';

type ClassNames = 'copyField' | 'copySection' | 'root';

const styles = (theme: Theme) =>
  createStyles({
    copyField: {
      marginTop: theme.spacing(0.5),
    },
    copySection: {
      marginTop: theme.spacing(3),
    },
    root: {},
  });

interface Props {
  message?: string;
  onClose: () => void;
  volumeLabel: string;
  volumePath: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const VolumeConfigDrawer: React.FC<CombinedProps> = (props) => {
  const { classes, message } = props;

  return (
    <React.Fragment>
      {message && <NoticePanel success={message} />}

      <div className={classes.copySection}>
        <Typography data-qa-config-help-msg variant="body1">
          To get started with a new volume, you&rsquo;ll want to create a
          filesystem on it:
        </Typography>
        <CopyableTextField
          className={classes.copyField}
          data-qa-make-filesystem
          hideLabel
          label="Create a Filesystem"
          value={`mkfs.ext4 "${props.volumePath}"`}
        />
      </div>

      <div className={classes.copySection}>
        <Typography data-qa-config-help-msg variant="body1">
          Once the volume has a filesystem, you can create a mountpoint for it:
        </Typography>
        <CopyableTextField
          className={classes.copyField}
          data-qa-mountpoint
          hideLabel
          label="Create a Mountpoint"
          value={`mkdir "/mnt/${props.volumeLabel}"`}
        />
      </div>

      <div className={classes.copySection}>
        <Typography data-qa-config-help-msg variant="body1">
          Then you can mount the new volume:
        </Typography>
        <CopyableTextField
          className={classes.copyField}
          data-qa-mount
          hideLabel
          label="Mount Volume"
          value={`mount "${props.volumePath}" "/mnt/${props.volumeLabel}"`}
        />
      </div>

      <div className={classes.copySection}>
        <Typography data-qa-config-help-msg variant="body1">
          If you want the volume to automatically mount every time your Linode
          boots, you&rsquo;ll want to add a line like the following to your
          /etc/fstab file:
        </Typography>
        <CopyableTextField
          className={classes.copyField}
          data-qa-boot-mount
          hideLabel
          label="Mount every time your Linode boots"
          value={`${props.volumePath} /mnt/${props.volumeLabel} ext4 defaults,noatime,nofail 0 2`}
        />
      </div>
    </React.Fragment>
  );
};

const styled = withStyles(styles);

export default styled(VolumeConfigDrawer);
