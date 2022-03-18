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
import HelpIcon from 'src/components/HelpIcon';
import { useAccount } from 'src/queries/account';
import { CreateTypes } from 'src/store/linodeCreate/linodeCreate.actions';
import AttachVLAN from './AttachVLAN';

const useStyles = makeStyles((theme: Theme) => ({
  vlan: {
    marginTop: theme.spacing(3),
  },
  addons: {
    marginTop: theme.spacing(3),
  },
  title: {
    marginBottom: theme.spacing(2),
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
  caption: {
    marginTop: -8,
    paddingLeft: theme.spacing(2) + 18, // 34,
    [theme.breakpoints.up('md')]: {
      paddingLeft: theme.spacing(4) + 18, // 50
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
  selectedImageID?: string;
  selectedTypeID?: string;
  labelError?: string;
  ipamError?: string;
  selectedRegionID?: string; // Used for filtering VLANs
  createType: CreateTypes;
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
    selectedImageID,
    selectedTypeID,
    createType,
  } = props;

  const hidePrivateIP = createType === 'fromLinode';

  const classes = useStyles();
  const { data: account } = useAccount();

  // Making this an && instead of the usual hasFeatureEnabled, which is || based.
  // Doing this so that we can toggle our flag without enabling vlans for all customers.
  const capabilities = account?.capabilities ?? [];

  // The VLAN section is shown when:
  // - the user has the capability
  // - the user is not creating by cloning (cloning copies the network interfaces)
  const showVlans =
    capabilities.includes('Vlans') && createType !== 'fromLinode';

  const isBareMetal = /metal/.test(selectedTypeID ?? '');

  const vlanDisabledReason = getVlanDisabledReason(
    isBareMetal,
    createType,
    selectedImageID
  );

  const backupsDisabledReason = isBareMetal
    ? 'Backups cannot be used with Bare Metal Linodes.'
    : null;

  const renderBackupsPrice = () => {
    const { backupsMonthly } = props;
    return (
      backupsMonthly && (
        <Grid item>
          <Typography variant="body1">
            <Currency quantity={backupsMonthly} /> per month
          </Typography>
        </Grid>
      )
    );
  };

  return (
    <>
      {showVlans ? (
        <Paper className={classes.vlan} data-qa-add-ons>
          <AttachVLAN
            vlanLabel={vlanLabel}
            labelError={labelError}
            ipamAddress={ipamAddress}
            ipamError={ipamError}
            readOnly={disabled || Boolean(vlanDisabledReason)}
            helperText={vlanDisabledReason}
            handleVLANChange={handleVLANChange}
            region={selectedRegionID}
          />
        </Paper>
      ) : null}
      <Paper className={classes.addons} data-qa-add-ons>
        <Typography variant="h2" className={classes.title}>
          Add-ons{' '}
          {backupsDisabledReason ? (
            <HelpIcon text={backupsDisabledReason} />
          ) : null}
        </Typography>
        <Grid container>
          <Grid item xs={12}>
            <FormControlLabel
              className={classes.label}
              control={
                <CheckBox
                  checked={accountBackups || props.backups}
                  onChange={changeBackups}
                  disabled={accountBackups || disabled || isBareMetal}
                  data-qa-check-backups={
                    accountBackups
                      ? 'auto backup enabled'
                      : 'auto backup disabled'
                  }
                />
              }
              label={
                <Grid container spacing={2} alignItems="center">
                  <Grid item>Backups</Grid>
                  {renderBackupsPrice()}
                </Grid>
              }
            />
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
          hidePrivateIP ? null : (
            <Grid container>
              <Grid item xs={12}>
                <Divider />
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
          )
        }
      </Paper>
    </>
  );
};

const getVlanDisabledReason = (
  isBareMetal: boolean,
  createType: CreateTypes,
  selectedImage?: string
) => {
  if (isBareMetal) {
    return 'VLANs cannot be used with Bare Metal Linodes.';
  } else if (createType === 'fromBackup') {
    return 'You cannot attach a VLAN when deploying to a new Linode from a backup.';
  } else if (!selectedImage) {
    return 'You must select an Image to attach a VLAN.';
  }
  return undefined;
};

export default React.memo(AddonsPanel);
