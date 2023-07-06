import { Interface, Linode } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { Link } from 'react-router-dom';
import CheckBox from 'src/components/CheckBox';
import Divider from 'src/components/core/Divider';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Paper from 'src/components/core/Paper';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Typography } from 'src/components/Typography';
import { Currency } from 'src/components/Currency';
import Grid from '@mui/material/Unstable_Grid2';
import { TooltipIcon } from 'src/components/TooltipIcon/TooltipIcon';
import { CreateTypes } from 'src/store/linodeCreate/linodeCreate.actions';
import AttachVLAN from './AttachVLAN';
import { privateIPRegex } from 'src/utilities/ipUtils';
import { useImageQuery } from 'src/queries/images';
import { Notice } from 'src/components/Notice/Notice';

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
    paddingLeft: `calc(${theme.spacing(2)} + 18px)`, // 34,
    [theme.breakpoints.up('md')]: {
      paddingLeft: `calc(${theme.spacing(4)} + 18px)`, // 50
    },
  },
}));

export interface AddonsPanelProps {
  backups: boolean;
  accountBackups: boolean;
  backupsMonthly?: number | null;
  isPrivateIPChecked: boolean;
  changeBackups: () => void;
  togglePrivateIP: () => void;
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
  selectedLinodeID?: number;
  linodesData?: Linode[];
}

export const AddonsPanel = React.memo((props: AddonsPanelProps) => {
  const {
    accountBackups,
    changeBackups,
    togglePrivateIP,
    disabled,
    vlanLabel,
    labelError,
    ipamAddress,
    ipamError,
    handleVLANChange,
    isPrivateIPChecked,
    selectedLinodeID,
    selectedRegionID,
    selectedImageID,
    selectedTypeID,
    createType,
    linodesData,
  } = props;

  const classes = useStyles();

  const { data: image } = useImageQuery(
    selectedImageID ?? '',
    Boolean(selectedImageID)
  );

  // The VLAN section is shown when the user is not creating by cloning (cloning copies the network interfaces)
  const showVlans = createType !== 'fromLinode';

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
        <Grid>
          <Typography variant="body1">
            <Currency quantity={backupsMonthly} /> per month
          </Typography>
        </Grid>
      )
    );
  };

  const checkBackupsWarning = () => {
    if (accountBackups || props.backups) {
      if (selectedLinodeID) {
        const selectedLinode = linodesData?.find(
          (linode) => linode.id === selectedLinodeID
        );
        if (
          selectedLinode?.image?.includes('private/') ||
          !selectedLinode?.image
        ) {
          return true;
        }
      } else if (selectedImageID && !image?.is_public) {
        return true;
      }
    }

    return false;
  };

  // The backups warning is shown when the user checks to enable backups, but they are using a custom image that may not be compatible.
  const showBackupsWarning = checkBackupsWarning();

  // Check whether the source Linode has been allocated a private IP to select/unselect the 'Private IP' checkbox.
  React.useEffect(() => {
    if (selectedLinodeID) {
      const selectedLinode = linodesData?.find(
        (image) => image.id === selectedLinodeID
      );
      const linodeHasPrivateIp = selectedLinode?.ipv4.some((ipv4) =>
        privateIPRegex.test(ipv4)
      );
      if (
        (linodeHasPrivateIp && !isPrivateIPChecked) ||
        (!linodeHasPrivateIp && isPrivateIPChecked)
      ) {
        togglePrivateIP();
      }
    }
  }, [selectedLinodeID]);

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
            <TooltipIcon text={backupsDisabledReason} status="help" />
          ) : null}
        </Typography>
        <Grid container>
          {showBackupsWarning && (
            <Notice warning>
              Linodes must have a disk formatted with an ext3 or ext4 file
              system to use the backup service.
            </Notice>
          )}
          <Grid xs={12}>
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
                  <Grid>Backups</Grid>
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

        <Grid container>
          <Grid xs={12}>
            <Divider />
            <FormControlLabel
              className={classes.label}
              control={
                <CheckBox
                  data-testid="private_ip"
                  checked={isPrivateIPChecked}
                  onChange={togglePrivateIP}
                  data-qa-check-private-ip
                  disabled={disabled}
                />
              }
              label="Private IP"
            />
          </Grid>
        </Grid>
      </Paper>
    </>
  );
});

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
