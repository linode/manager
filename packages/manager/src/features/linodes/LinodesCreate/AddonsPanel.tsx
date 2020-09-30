import * as React from 'react';
import { Link } from 'react-router-dom';
import CheckBox from 'src/components/CheckBox';
import Divider from 'src/components/core/Divider';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Currency from 'src/components/Currency';
import Grid from 'src/components/Grid';
import useFlags from 'src/hooks/useFlags';
import SelectVLAN from './SelectVLAN';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    marginTop: theme.spacing(3),
    backgroundColor: theme.color.white
  },
  flex: {
    flex: 1
  },
  title: {
    marginBottom: theme.spacing(2)
  },
  divider: {
    marginTop: theme.spacing(1)
  },
  lastItem: {
    paddingBottom: '0 !important'
  },
  inner: {
    padding: theme.spacing(3)
  },
  panelBody: {
    padding: `${theme.spacing(3)}px 0 ${theme.spacing(1)}px`
  },
  label: {
    '& > span:last-child': {
      color: theme.color.headline,
      fontFamily: theme.font.bold,
      fontSize: '1rem',
      lineHeight: '1.2em',
      [theme.breakpoints.up('md')]: {
        marginLeft: theme.spacing(2)
      }
    }
  },
  subLabel: {
    display: 'inline-block',
    position: 'relative',
    top: 3
  },
  caption: {
    marginTop: -8,
    paddingLeft: theme.spacing(2) + 18, // 34,
    [theme.breakpoints.up('md')]: {
      paddingLeft: theme.spacing(4) + 18 // 50
    }
  },
  vlanSelect: {
    paddingLeft: '54px !important'
  }
}));

interface Props {
  backups: boolean;
  accountBackups: boolean;
  backupsMonthly?: number | null;
  privateIP: boolean;
  changeBackups: () => void;
  changePrivateIP: () => void;
  changeSelectedVLAN: (vlanID: number | null) => void;
  disabled?: boolean;
  hidePrivateIP?: boolean;
  selectedVlanID: number | null;
  vlanError?: string;
  selectedRegionID?: string; // Used for filtering VLANs
}

type CombinedProps = Props;
const AddonsPanel: React.FC<CombinedProps> = props => {
  const {
    accountBackups,
    changeBackups,
    changePrivateIP,
    changeSelectedVLAN,
    vlanError,
    disabled
  } = props;

  const flags = useFlags();

  const handleVlanChange = React.useCallback(
    (vlan: number | null) => {
      changeSelectedVLAN(vlan);
    },
    [changeSelectedVLAN]
  );

  const classes = useStyles();

  const renderBackupsPrice = () => {
    const { backupsMonthly } = props;
    return (
      backupsMonthly && (
        <Grid item className={classes.subLabel}>
          <Typography variant="body1">
            <Currency quantity={backupsMonthly} /> per month
          </Typography>
        </Grid>
      )
    );
  };

  return (
    <Paper className={classes.root} data-qa-add-ons>
      <div className={classes.inner}>
        <Typography variant="h2" className={classes.title}>
          Optional Add-ons
        </Typography>
        <Grid container>
          <Grid item xs={12}>
            <FormControlLabel
              className={classes.label}
              control={
                <CheckBox
                  checked={accountBackups || props.backups}
                  onChange={changeBackups}
                  disabled={accountBackups || disabled}
                  data-qa-check-backups={
                    accountBackups
                      ? 'auto backup enabled'
                      : 'auto backup disabled'
                  }
                />
              }
              label="Backups"
            />
            {renderBackupsPrice()}
            <Typography variant="body1" className={classes.caption}>
              {accountBackups ? (
                <React.Fragment>
                  You have enabled automatic backups for your account. This
                  Linode will automatically have backups enabled. To change this
                  setting, <Link to={'/account/settings'}>click here.</Link>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  Three backup slots are executed and rotated automatically: a
                  daily backup, a 2-7 day old backup, and an 8-14 day old
                  backup. Plans are priced according to the Linode plan selected
                  above.
                </React.Fragment>
              )}
            </Typography>
          </Grid>
        </Grid>
        {/** /v4/linodes/instances/clone does *not* support the private IP flag */
        props.hidePrivateIP ? null : (
          <React.Fragment>
            <Grid container className={classes.divider}>
              <Grid item xs={12}>
                <Divider />
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={12}>
                <FormControlLabel
                  className={classes.label}
                  control={
                    <CheckBox
                      checked={props.privateIP}
                      onChange={() => changePrivateIP()}
                      data-qa-check-private-ip
                      disabled={disabled}
                    />
                  }
                  label="Private IP"
                />
              </Grid>
            </Grid>
          </React.Fragment>
        )}
        {flags.cmr && flags.vlans ? (
          <Grid container className={classes.lastItem}>
            <Grid item xs={12}>
              <Divider className={classes.divider} />
            </Grid>
            <div className={classes.vlanSelect}>
              <SelectVLAN
                selectedRegionID={props.selectedRegionID}
                selectedVlanID={props.selectedVlanID}
                handleSelectVLAN={handleVlanChange}
                error={vlanError}
              />
            </div>
          </Grid>
        ) : null}
      </div>
    </Paper>
  );
};

export default React.memo(AddonsPanel);
