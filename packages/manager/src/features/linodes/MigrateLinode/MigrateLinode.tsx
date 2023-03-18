import { Event, Notification } from '@linode/api-v4/lib/account';
import { scheduleOrQueueMigration } from '@linode/api-v4/lib/linodes';
import { APIError as APIErrorType } from '@linode/api-v4/lib/types';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Dialog from 'src/components/Dialog';
import HelpIcon from 'src/components/HelpIcon';
import Notice from 'src/components/Notice';
import { MBpsInterDC } from 'src/constants';
import { resetEventsPolling } from 'src/eventsPolling';
import EUAgreementCheckbox from 'src/features/Account/Agreements/EUAgreementCheckbox';
import { addUsedDiskSpace } from 'src/features/linodes/LinodesDetail/LinodeAdvanced/LinodeDiskSpace';
import { displayType } from 'src/features/linodes/presentation';
import useExtendedLinode from 'src/hooks/useExtendedLinode';
import { useSpecificTypes } from 'src/queries/types';
import {
  reportAgreementSigningError,
  useAccountAgreements,
  useMutateAccountAgreements,
} from 'src/queries/accountAgreements';
import { listToItemsByID } from 'src/queries/base';
import { useAllImagesQuery } from 'src/queries/images';
import { useProfile } from 'src/queries/profile';
import { ApplicationState } from 'src/store';
import { formatDate } from 'src/utilities/formatDate';
import { isEURegion } from 'src/utilities/formatRegion';
import { sendMigrationInitiatedEvent } from 'src/utilities/ga';
import { getLinodeDescription } from 'src/utilities/getLinodeDescription';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import CautionNotice from './CautionNotice';
import ConfigureForm from './ConfigureForm';
import { extendType } from 'src/utilities/extendType';

const useStyles = makeStyles((theme: Theme) => ({
  details: {
    marginTop: theme.spacing(2),
  },
  actionWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  vlanHelperText: {
    marginTop: theme.spacing(0.5),
  },
  buttonGroup: {
    marginTop: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
    },
  },
  agreement: {
    maxWidth: '70%',
    [theme.breakpoints.down('md')]: {
      maxWidth: 'unset',
    },
  },
  button: {
    [theme.breakpoints.down('md')]: {
      marginTop: theme.spacing(2),
    },
  },
}));

interface Props {
  linodeID: number;
  open: boolean;
  onClose: () => void;
}

type CombinedProps = Props & WithTypesAndImages;

const MigrateLinode: React.FC<CombinedProps> = (props) => {
  const { linodeID, notifications, onClose, open } = props;
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const linode = useExtendedLinode(linodeID);
  const typesQuery = useSpecificTypes(linode?.type ? [linode.type] : []);
  const type = typesQuery[0]?.data ? extendType(typesQuery[0].data) : undefined;

  const { data: imagesData } = useAllImagesQuery({}, {}, open);
  const images = listToItemsByID(imagesData ?? []);

  const { data: profile } = useProfile();
  const { data: agreements } = useAccountAgreements(open);
  const { mutateAsync: updateAccountAgreements } = useMutateAccountAgreements();

  const [selectedRegion, handleSelectRegion] = React.useState<string | null>(
    null
  );
  const [regionError, setRegionError] = React.useState<string>('');
  const [acceptError, setAcceptError] = React.useState<string>('');
  const [APIError, setAPIError] = React.useState<string>('');
  const [hasConfirmed, setConfirmed] = React.useState<boolean>(false);
  const [isLoading, setLoading] = React.useState<boolean>(false);
  const [hasSignedAgreement, setHasSignedAgreement] = React.useState<boolean>(
    false
  );

  const showAgreement = Boolean(
    !profile?.restricted &&
      agreements?.eu_model === false &&
      isEURegion(selectedRegion)
  );

  React.useEffect(() => {
    scrollErrorIntoView();
  }, [regionError, APIError, acceptError]);

  React.useEffect(() => {
    if (open) {
      setAPIError('');
      setRegionError('');
      setConfirmed(false);
      handleSelectRegion(null);
    }
  }, [open]);

  if (!linode) {
    return null;
  }

  const region = linode.region;

  const handleMigrate = () => {
    setRegionError('');
    setAcceptError('');
    setAPIError('');

    /** region is an optional param so enforce it client-side */
    if (!selectedRegion) {
      setRegionError('Please select a region.');
    }

    if (!hasConfirmed) {
      setAcceptError('Please accept the conditions of this migration.');
    }

    if (!selectedRegion || !hasConfirmed) {
      return;
    }

    setLoading(true);

    return scheduleOrQueueMigration(linodeID, {
      region: selectedRegion,
    })
      .then(() => {
        resetEventsPolling();
        setLoading(false);
        sendMigrationInitiatedEvent(
          region,
          selectedRegion,
          +formatDate(new Date().toISOString(), {
            format: 'H',
          })
        );
        enqueueSnackbar(
          'Your Linode has entered the migration queue and will begin migration shortly.',
          { variant: 'success' }
        );
        if (hasSignedAgreement) {
          updateAccountAgreements({
            eu_model: true,
            privacy_policy: true,
          }).catch(reportAgreementSigningError);
        }
        onClose();
      })
      .catch((e: APIErrorType[]) => {
        setLoading(false);
        setAPIError(e[0].reason);
      });
  };

  const newLabel = getLinodeDescription(
    displayType(linode.type, type ? [type] : []),
    linode.specs.memory,
    linode.specs.disk,
    linode.specs.vcpus,
    linode.image ?? null,
    images
  );

  const disabledText = getDisabledReason(
    linode._events,
    linode.status,
    linodeID,
    notifications
  );

  /** how long will this take to migrate when the migration starts */
  const migrationTimeInMinutes = Math.ceil(
    addUsedDiskSpace(linode._disks) / MBpsInterDC / 60
  );

  return (
    <Dialog
      title={`Migrate Linode ${linode.label ?? ''}`}
      open={open}
      onClose={onClose}
      fullWidth
      fullHeight
      maxWidth="md"
    >
      {APIError && <Notice error text={APIError} />}

      <Typography className={classes.details} variant="h2">
        {newLabel}
      </Typography>
      {/*
         commenting out for now because we need further clarification from
         stakeholders about whether or not we want to prevent multiple cross-datacenter migrations.
         */}
      {/* <MigrationImminentNotice
        linodeID={props.linodeID}
        notifications={notifications}
      /> */}
      <CautionNotice
        linodeId={linodeID}
        setConfirmed={setConfirmed}
        hasConfirmed={hasConfirmed}
        error={acceptError}
        migrationTimeInMins={migrationTimeInMinutes}
      />
      <ConfigureForm
        currentRegion={region}
        handleSelectRegion={handleSelectRegion}
        selectedRegion={selectedRegion}
      />
      <Box
        display="flex"
        justifyContent={showAgreement ? 'space-between' : 'flex-end'}
        alignItems="center"
        className={classes.buttonGroup}
      >
        {showAgreement ? (
          <EUAgreementCheckbox
            checked={hasSignedAgreement}
            onChange={(e) => setHasSignedAgreement(e.target.checked)}
            className={classes.agreement}
            centerCheckbox
          />
        ) : null}
        <Button
          buttonType="primary"
          disabled={
            !!disabledText ||
            !hasConfirmed ||
            !selectedRegion ||
            (showAgreement && !hasSignedAgreement)
          }
          loading={isLoading}
          onClick={handleMigrate}
          className={classes.button}
        >
          Enter Migration Queue
        </Button>
        {!!disabledText && <HelpIcon text={disabledText} />}
      </Box>
    </Dialog>
  );
};

interface WithTypesAndImages {
  notifications: Notification[];
}

const mapStateToProps: MapStateToProps<
  WithTypesAndImages,
  {},
  ApplicationState
> = (state) => ({
  notifications: state.__resources.notifications.data || [],
});

const withReduxState = connect(mapStateToProps);

export default compose<CombinedProps, Props>(
  withReduxState,
  React.memo
)(MigrateLinode);

const getDisabledReason = (
  events: Event[],
  linodeStatus: string,
  linodeID: number,
  notifications: Notification[]
) => {
  if (
    events[0]?.action === 'linode_migrate_datacenter' &&
    events[0]?.percent_complete !== 100
  ) {
    return `Your Linode is currently being migrated.`;
  }

  /**
   * commenting this out for now because we need further clarification
   * from stakeholders about if we want people to overwrite existing migrations.
   */

  // if (
  //   !!notifications.find(eachNotification => {
  //     return (
  //       eachNotification.label.match(/migrat/i) &&
  //       eachNotification.entity &&
  //       eachNotification.entity.id === linodeID
  //     );
  //   })
  // ) {
  //   return 'Your Linode is already scheduled for a migration';
  // }

  return '';
};
