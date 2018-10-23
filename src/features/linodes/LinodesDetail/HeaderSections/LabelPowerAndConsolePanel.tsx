import * as React from 'react';
import { Link } from 'react-router-dom';

import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import {
  StyleRulesCallback,
  
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';

import EditableText from 'src/components/EditableText';
import Grid from 'src/components/Grid';

import LinodePowerControl from '../LinodePowerControl';

type ClassNames = 'root' | 'titleWrapper' | 'backButton' | 'cta' | 'launchButton';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 5,
  },
  backButton: {
    margin: '5px 0 0 -16px',
    '& svg': {
      width: 34,
      height: 34,
    },
  },
  cta: {
    marginTop: theme.spacing.unit,
    [theme.breakpoints.down('sm')]: {
      margin: 0,
      display: 'flex',
      flexBasis: '100%',
    },
  },
  launchButton: {
    padding: '12px 28px 14px 0',
    '&:hover': {
      backgroundColor: 'transparent',
      textDecoration: 'underline',
    },
    '&:focus > span:first-child': {
      outline: '1px dotted #999',
    }
  },
});

interface ReducedLinode {
  recentEvent?: Linode.Event;
  status: Linode.LinodeStatus;
  id: number;
  label: string;
}

interface LabelInput {
  label: string;
  errorText: string;
  onCancel: () => void;
  onEdit: (value: string) => void;
}

interface Props {
  launchLish: () => void;
  linode: ReducedLinode;
  openConfigDrawer: (config: Linode.Config[], action: (id: number) => void) => void;
  labelInput: LabelInput;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const LabelPowerAndConsolePanel: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, linode, launchLish, openConfigDrawer, labelInput } = props;

  return (
    <Grid
      container
      justify="space-between"
    >
      <Grid item className={classes.titleWrapper}>
        <Link to={`/linodes`}>
          <IconButton
            className={classes.backButton}
          >
            <KeyboardArrowLeft />
          </IconButton>
        </Link>
        <EditableText
          role="header"
          variant="headline"
          text={labelInput.label}
          errorText={labelInput.errorText}
          onEdit={labelInput.onEdit}
          onCancel={labelInput.onCancel}
          data-qa-label
        />
      </Grid>
      <Grid item className={classes.cta}>
        <Button
          onClick={launchLish}
          className={classes.launchButton}
          data-qa-launch-console
          disableFocusRipple={true}
          disableRipple={true}
          >
          Launch Console
    </Button>
        <LinodePowerControl
          status={linode.status}
          recentEvent={linode.recentEvent}
          id={linode.id}
          label={linode.label}
          openConfigDrawer={openConfigDrawer}
        />
      </Grid>
    </Grid>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(LabelPowerAndConsolePanel);
