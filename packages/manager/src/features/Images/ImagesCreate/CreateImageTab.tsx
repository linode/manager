import { Disk, getLinodeDisks, Linode } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { makeStyles } from '@material-ui/styles';
import { useSnackbar } from 'notistack';
import { equals } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import Paper from 'src/components/core/Paper';
import { Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import withImages, {
  ImagesDispatch,
} from 'src/containers/withImages.container';
import { resetEventsPolling } from 'src/eventsPolling';
import DiskSelect from 'src/features/linodes/DiskSelect';
import LinodeSelect from 'src/features/linodes/LinodeSelect';
import useFlags from 'src/hooks/useFlags';
import { useGrants, useProfile } from 'src/queries/profile';
import calculateCostFromUnitPrice from 'src/utilities/calculateCostFromUnitPrice';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import { convertStorageUnit } from 'src/utilities/unitConversions';
import ImagesPricingCopy from './ImagesPricingCopy';

const useStyles = makeStyles((theme: Theme) => ({
  helperText: {
    paddingTop: theme.spacing(1) / 2,
  },
  container: {
    padding: theme.spacing(3),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(),
    '& .MuiFormHelperText-root': {
      marginBottom: theme.spacing(2),
    },
  },
  buttonGroup: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'flex-end',
    },
  },
}));

export interface Props {
  label?: string;
  description?: string;
  changeLabel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  changeDescription: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CreateImageTab: React.FC<Props & ImagesDispatch> = (props) => {
  const {
    label,
    description,
    changeLabel,
    changeDescription,
    createImage,
  } = props;

  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { push } = useHistory();

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const [selectedLinode, setSelectedLinode] = React.useState<Linode>();
  const [selectedDisk, setSelectedDisk] = React.useState<string | null>('');
  const [disks, setDisks] = React.useState<Disk[]>([]);
  const [notice, setNotice] = React.useState<string | undefined>();
  const [errors, setErrors] = React.useState<APIError[] | undefined>();
  const [submitting, setSubmitting] = React.useState<boolean>(false);

  const canCreateImage =
    Boolean(!profile?.restricted) || Boolean(grants?.global?.add_images);

  const availableLinodesToImagize = profile?.restricted
    ? grants?.linode
        .filter((thisGrant) => thisGrant.permissions === 'read_write')
        .map((thisGrant) => thisGrant.id) ?? []
    : null;

  const fetchLinodeDisksOnLinodeChange = (selectedLinode: number) => {
    setSelectedDisk('');

    getLinodeDisks(selectedLinode)
      .then((response) => {
        const filteredDisks = response.data.filter(
          (disk) => disk.filesystem !== 'swap'
        );

        if (!equals(disks, filteredDisks)) {
          setDisks(filteredDisks);
        }
      })
      .catch((_) => {
        setErrors([
          {
            field: 'disk_id',
            reason: 'Could not retrieve disks for this Linode.',
          },
        ]);
      });
  };

  const changeSelectedLinode = (linode: Linode) => {
    fetchLinodeDisksOnLinodeChange(linode.id);
    setSelectedLinode(linode);
  };

  const handleLinodeChange = (linode: Linode) => {
    // Clear any errors
    setErrors(undefined);
    changeSelectedLinode(linode);
  };

  const handleDiskChange = (diskID: string | null) => {
    // Clear any errors
    setErrors(undefined);
    setSelectedDisk(diskID);
  };

  const onSubmit = () => {
    setErrors(undefined);
    setNotice(undefined);
    setSubmitting(true);

    const safeDescription = description ?? '';
    createImage({
      diskID: Number(selectedDisk),
      label,
      description: safeDescription,
    })
      .then((_) => {
        resetEventsPolling();

        setSubmitting(false);

        enqueueSnackbar('Image scheduled for creation.', {
          variant: 'info',
        });

        push('/images');
      })
      .catch((errorResponse) => {
        setSubmitting(false);
        setErrors(
          getAPIErrorOrDefault(
            errorResponse,
            'There was an error creating the image.'
          )
        );
      });
  };

  const checkRequirements = () => {
    // When creating an image, disable the submit button until a Linode and
    // disk are selected.
    const isDiskSelected = Boolean(selectedDisk);

    return !(isDiskSelected && selectedLinode);
  };

  const requirementsMet = checkRequirements();

  const flags = useFlags();
  const isImagePricingEnabled = Boolean(flags.imagesPriceInfo);
  const selectedDiskData: Disk | undefined = disks.find(
    (d) => `${d.id}` === selectedDisk
  );
  const selectedDiskSizeInGB = convertStorageUnit(
    'MB',
    selectedDiskData?.size,
    'GB'
  );

  const hasErrorFor = getAPIErrorFor(
    {
      linode_id: 'Linode',
      disk_id: 'Disk',
      region: 'Region',
      size: 'Size',
      label: 'Label',
    },
    errors
  );

  const labelError = hasErrorFor('label');
  const descriptionError = hasErrorFor('description');
  const generalError = hasErrorFor('none');
  const linodeError = hasErrorFor('linode_id');
  const diskError = hasErrorFor('disk_id');

  return (
    <Paper className={classes.container}>
      {!canCreateImage ? (
        <Notice
          error
          text="You don't have permissions to create a new Image. Please contact an account administrator for details."
        />
      ) : null}
      {generalError ? (
        <Notice error text={generalError} data-qa-notice />
      ) : null}
      {notice ? <Notice success text={notice} data-qa-notice /> : null}
      <ImagesPricingCopy type="captureImage" />
      <LinodeSelect
        selectedLinode={selectedLinode?.id || null}
        linodeError={linodeError}
        disabled={!canCreateImage}
        handleChange={(linode) => handleLinodeChange(linode)}
        filterCondition={(linode) =>
          availableLinodesToImagize
            ? availableLinodesToImagize.includes(linode.id)
            : true
        }
        updateFor={[
          selectedLinode,
          linodeError,
          classes,
          canCreateImage,
          availableLinodesToImagize,
        ]}
      />

      <>
        <DiskSelect
          selectedDisk={selectedDisk}
          disks={disks}
          diskError={diskError}
          handleChange={handleDiskChange}
          updateFor={[disks, selectedDisk, diskError, classes]}
          disabled={!canCreateImage}
          data-qa-disk-select
        />
        {isImagePricingEnabled ? (
          <Typography className={classes.helperText} variant="body1">
            {`Estimated: ${calculateCostFromUnitPrice(
              0.1,
              selectedDiskSizeInGB
            )}/month`}
          </Typography>
        ) : null}
        <Typography className={classes.helperText} variant="body1">
          Linode Images cannot be created if you are using raw disks or disks
          that have been formatted using custom filesystems.
        </Typography>
      </>

      <>
        <TextField
          label="Label"
          value={label}
          onChange={changeLabel}
          error={Boolean(labelError)}
          errorText={labelError}
          disabled={!canCreateImage}
          data-qa-image-label
        />
        <TextField
          label="Description"
          multiline
          rows={4}
          value={description}
          onChange={changeDescription}
          error={Boolean(descriptionError)}
          errorText={descriptionError}
          disabled={!canCreateImage}
          data-qa-image-description
        />
      </>

      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        flexWrap="wrap"
        className={classes.buttonGroup}
      >
        <Button
          onClick={onSubmit}
          disabled={requirementsMet || !canCreateImage}
          loading={submitting}
          buttonType="primary"
          data-qa-submit
        >
          Create Image
        </Button>
      </Box>
    </Paper>
  );
};

export default compose<Props & ImagesDispatch, Props>(withImages())(
  CreateImageTab
);
