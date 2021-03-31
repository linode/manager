import { Interface } from '@linode/api-v4/lib/linodes';
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
import useAccount from 'src/hooks/useAccount';
import useFlags from 'src/hooks/useFlags';
import { useRegionsQuery } from 'src/queries/regions';
import { doesRegionSupportVLANs } from 'src/utilities/doesRegionSupportVLANs';
import AttachVLAN from './AttachVLAN';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    marginTop: theme.spacing(3),
    backgroundColor: theme.color.white,
  },
  flex: {
    flex: 1,
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  divider: {
    marginTop: theme.spacing(1),
  },
  lastItem: {
    paddingBottom: '0 !important',
  },
  inner: {
    padding: theme.spacing(3),
  },
  panelBody: {
    padding: `${theme.spacing(3)}px 0 ${theme.spacing(1)}px`,
  },
  label: {
    '& > span:last-child': {
      color: theme.color.headline,
      fontFamily: theme.font.bold,
      fontSize: '1rem',
      lineHeight: '1.2em',
      [theme.breakpoints.up('md')]: {
        marginLeft: theme.spacing(2),
      },
    },
  },
  subLabel: {
    display: 'inline-block',
    position: 'relative',
    top: 3,
  },
  caption: {
    marginTop: -8,
    paddingLeft: theme.spacing(2) + 18, // 34,
    [theme.breakpoints.up('md')]: {
      paddingLeft: theme.spacing(4) + 18, // 50
    },
  },
  vlanSelect: {
    paddingLeft: theme.spacing(2) + 24,
    paddingTop: theme.spacing(),
    paddingBottom: theme.spacing(),
    [theme.breakpoints.up('md')]: {
      paddingLeft: theme.spacing(4) + 24,
    },
  },
}));

interface Props {
  backups: boolean;
  accountBackups: boolean;
  backupsMonthly?: number | null;
  privateIP: boolean;
  changeBackups: () => void;
  changePrivateIP: () => void;
  vlanLabel: string;
  ipamAddress: string;
  handleVLANChange: (updatedInterface: Interface) => void;
  disabled?: boolean;
  hidePrivateIP?: boolean;
  labelError?: string;
  ipamError?: string;
  selectedRegionID?: string; // Used for filtering VLANs
}

type CombinedProps = Props;
const AddonsPanel: React.FC<CombinedProps> = (props) => {
  const {
    accountBackups,
    changeBackups,
    changePrivateIP,
    disabled,
    vlanLabel,
    labelError,
    ipamAddress,
    ipamError,
    handleVLANChange,
    selectedRegionID,
  } = props;

  const classes = useStyles();
  const flags = useFlags();
  const { account } = useAccount();

  const regions = useRegionsQuery().data ?? [];
  const selectedRegion = selectedRegionID || '';

  // Making this an && instead of the usual hasFeatureEnabled, which is || based.
  // Doing this so that we can toggle our flag without enabling vlans for all customers.
  const capabilities = account?.data?.capabilities ?? [];
  const showVlans = capabilities.includes('Vlans') && flags.vlans;

  const regionSupportsVLANs = doesRegionSupportVLANs(selectedRegion, regions);

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
        {showVlans && regionSupportsVLANs ? (
          <AttachVLAN
            vlanLabel={vlanLabel}
            labelError={labelError}
            ipamAddress={ipamAddress}
            ipamError={ipamError}
            readOnly={disabled}
            handleVLANChange={handleVLANChange}
            region={selectedRegionID}
          />
        ) : null}
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
        {
          /** /v4/linodes/instances/clone does *not* support the private IP flag */
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
          )
        }
      </div>
    </Paper>
  );
};

export default React.memo(AddonsPanel);
