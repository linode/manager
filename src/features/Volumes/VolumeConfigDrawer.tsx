import * as React from 'react';

import Button from '@material-ui/core/Button';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import Drawer from 'src/components/Drawer';

import CopyableTextField from './CopyableTextField';

type ClassNames = 'root'
| 'copySection'
| 'copyField';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  copySection: {
    marginTop: theme.spacing.unit * 2,
  },
  copyField: {
    marginTop: theme.spacing.unit,
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
      title="Volume Configuration"
    >
      {(props.volumePath && props.volumeLabel) &&
        <React.Fragment>
          <div className={classes.copySection}>
            <Typography variant="body1" data-qa-config-help-msg>
              To get started with a new volume, you'll want to create a filesystem on it:
            </Typography>
            <CopyableTextField
              className={classes.copyField}
              value={`mkfs.ext4 "${props.volumePath}"`}
            />
          </div>

          <div className={classes.copySection}>
            <Typography variant="body1" data-qa-config-help-msg>
              Once the volume has a filesystem, you can create a mountpoint for it:
            </Typography>
            <CopyableTextField
              className={classes.copyField}
              value={`mkdir "/mnt/${props.volumeLabel}"`}
            />
          </div>

          <div className={classes.copySection}>
            <Typography variant="body1" data-qa-config-help-msg>
              Then you can mount the new volume:
            </Typography>
            <CopyableTextField
              className={classes.copyField}
              value={`mount "${props.volumePath}" "/mnt/${props.volumeLabel}"`}
            />
          </div>

          <div className={classes.copySection}>
            <Typography variant="body1" data-qa-config-help-msg>
              If you want the volume to automatically mount every time your
              Linode boots, you'll want to add a line like the following to
              your /etc/fstab file:
            </Typography>
            <CopyableTextField
              className={classes.copyField}
              value={`${props.volumePath} /mnt/${props.volumeLabel} ext4 defaults,noatime 0 2`}
            />
          </div>
          <ActionsPanel>
            <Button
              variant="raised"
              color="primary"
              onClick={props.onClose}
              data-qa-cancel
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
