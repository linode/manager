import { Interface, Linode } from '@linode/api-v4/lib/linodes';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { Checkbox } from 'src/components/Checkbox';
import { Currency } from 'src/components/Currency';
import { Divider } from 'src/components/Divider';
import { Notice } from 'src/components/Notice/Notice';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { Paper } from 'src/components/Paper';
import { useImageQuery } from 'src/queries/images';
import { CreateTypes } from 'src/store/linodeCreate/linodeCreate.actions';
import { privateIPRegex } from 'src/utilities/ipUtils';

import AttachVLAN from './AttachVLAN';

const useStyles = makeStyles((theme: Theme) => ({
  addons: {
    marginTop: theme.spacing(3),
  },
  caption: {
    marginTop: -8,
    paddingLeft: `calc(${theme.spacing(2)} + 18px)`, // 34,
    [theme.breakpoints.up('md')]: {
      paddingLeft: `calc(${theme.spacing(4)} + 18px)`, // 50
    },
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
  title: {
    marginBottom: theme.spacing(2),
  },
  vlan: {
    marginTop: theme.spacing(3),
  },
}));

export interface AddonsPanelProps {
  accountBackups: boolean;
  backups: boolean;
  backupsMonthly?: null | number;
  changeBackups: () => void;
  createType: CreateTypes;
  disabled?: boolean;
  handleVLANChange: (updatedInterface: Interface) => void;
  ipamAddress: string;
  ipamError?: string;
  isPrivateIPChecked: boolean;
  labelError?: string;
  linodesData?: Linode[];
  selectedImageID?: string;
  selectedLinodeID?: number;
  selectedRegionID?: string; // Used for filtering VLANs
  selectedTypeID?: string;
  togglePrivateIP: () => void;
  vlanLabel: string;
}

export const AddonsPanel = React.memo((props: AddonsPanelProps) => {
  const {
    accountBackups,
    changeBackups,
    createType,
    disabled,
    handleVLANChange,
    ipamAddress,
    ipamError,
    isPrivateIPChecked,
    labelError,
    linodesData,
    selectedImageID,
    selectedLinodeID,
    selectedRegionID,
    selectedTypeID,
    togglePrivateIP,
    vlanLabel,
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
            handleVLANChange={handleVLANChange}
            helperText={vlanDisabledReason}
            ipamAddress={ipamAddress}
            ipamError={ipamError}
            labelError={labelError}
            readOnly={disabled || Boolean(vlanDisabledReason)}
            region={selectedRegionID}
            vlanLabel={vlanLabel}
          />
        </Paper>
      ) : null}
      <Paper className={classes.addons} data-qa-add-ons>
        <Typography className={classes.title} variant="h2">
          Add-ons{' '}
          {backupsDisabledReason ? (
            <TooltipIcon status="help" text={backupsDisabledReason} />
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
              control={
                <Checkbox
                  data-qa-check-backups={
                    accountBackups
                      ? 'auto backup enabled'
                      : 'auto backup disabled'
                  }
                  checked={accountBackups || props.backups}
                  disabled={accountBackups || disabled || isBareMetal}
                  onChange={changeBackups}
                />
              }
              label={
                <Grid alignItems="center" container spacing={2}>
                  <Grid>Backups</Grid>
                  {renderBackupsPrice()}
                </Grid>
              }
              className={classes.label}
            />
            <Typography className={classes.caption} variant="body1">
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
              control={
                <Checkbox
                  checked={isPrivateIPChecked}
                  data-qa-check-private-ip
                  data-testid="private_ip"
                  disabled={disabled}
                  onChange={togglePrivateIP}
                />
              }
              className={classes.label}
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
