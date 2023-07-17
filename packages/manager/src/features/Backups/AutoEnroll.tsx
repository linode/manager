import { Theme } from '@mui/material/styles';
import { WithStyles, createStyles, withStyles } from '@mui/styles';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Toggle } from 'src/components/Toggle';
import { Typography } from 'src/components/Typography';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { Paper } from 'src/components/Paper';

type ClassNames = 'header' | 'root' | 'toggleLabel' | 'toggleLabelText';

const styles = (theme: Theme) =>
  createStyles({
    header: {
      fontSize: 17,
      marginBottom: theme.spacing(1),
    },
    root: {
      backgroundColor: theme.bg.offWhite,
      padding: theme.spacing(1),
    },
    toggleLabel: {
      alignItems: 'flex-start',
      display: 'flex',
      marginBottom: theme.spacing(1),
      marginLeft: 0,
    },
    toggleLabelText: {
      marginTop: theme.spacing(1) + theme.spacing(0.5),
    },
  });

interface Props {
  enabled: boolean;
  error?: string;
  toggle: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const AutoEnroll: React.FC<CombinedProps> = (props) => {
  const { classes, enabled, error, toggle } = props;

  return (
    <Paper className={classes.root}>
      {error && <Notice error text={error} />}
      <FormControlLabel
        control={
          <Toggle checked={enabled} data-qa-enable-toggle onChange={toggle} />
        }
        label={
          <div className={classes.toggleLabelText}>
            <Typography className={classes.header}>
              Auto Enroll All New Linodes in Backups
            </Typography>
            <Typography variant="body1">
              {`Enroll all future Linodes in backups. Your account will be billed
                    the additional hourly rate noted on the `}
              <Link
                data-qa-backups-price
                external
                fixedIcon
                to="https://www.linode.com/products/backups/"
              >
                Backups pricing page
              </Link>
            </Typography>
          </div>
        }
        className={classes.toggleLabel}
      />
    </Paper>
  );
};

const styled = withStyles(styles);

export default styled(AutoEnroll);
