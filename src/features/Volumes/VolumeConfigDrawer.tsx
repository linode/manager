import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';

import ActionsPanel from 'src/components/ActionsPanel';
import Drawer from 'src/components/Drawer';

import CopyableTextField from './CopyableTextField';

type ClassNames = 'root'
|  'copyField';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  copyField: {
    margin: `${theme.spacing.unit}px 0 ${theme.spacing.unit * 2}px`,
  },
});

interface Props {
  open: boolean;
  onClose: () => void;
  volumePath?: string;
  volumeLabel?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const VolumeConfigDrawer: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes } = props;
  return (
    <Drawer
      open={props.open}
      onClose={props.onClose}
      title="Volume Configuation"
    >
      {(props.volumePath && props.volumeLabel) &&
        <React.Fragment>
          <Typography variant="body1">
            To get started with a new volume, you'll want to create a filesystem on it:
          </Typography>
          <CopyableTextField
            className={classes.copyField}
            value={`mkfs.ext4 "${props.volumePath}"`}
          />

          <Typography variant="body1">
            Once the volume has a filesystem, you can create a mountpoint for it:
          </Typography>
          <CopyableTextField
            className={classes.copyField}
            value={`mkdir "/mnt/${props.volumeLabel}"`}
          />

          <Typography variant="body1">
            Then you can mount the new volume:
          </Typography>
          <CopyableTextField
            className={classes.copyField}
            value={`mount "${props.volumePath}" "/mnt/${props.volumeLabel}"`}
          />

          <Typography variant="body1">
            If you want the volume to automatically mount every time your
            Linode boots, you'll want to add a line like the following to
            your /etc/fstab file:
          </Typography>
          <CopyableTextField
            className={classes.copyField}
            value={`${props.volumePath} /mnt/${props.volumeLabel}`}
          />

          <ActionsPanel>
            <Button
              variant="raised"
              color="primary"
              onClick={props.onClose}
            >
              Close
            </Button>
          </ActionsPanel>
        </React.Fragment>
      }
    </Drawer>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(VolumeConfigDrawer);
