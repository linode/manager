import { Disk, Linode, getLinodeDisks } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import { equals } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Checkbox } from 'src/components/Checkbox';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { resetEventsPolling } from 'src/eventsPolling';
import { DiskSelect } from 'src/features/Linodes/DiskSelect/DiskSelect';
import { LinodeSelect } from 'src/features/Linodes/LinodeSelect/LinodeSelect';
import { useFlags } from 'src/hooks/useFlags';
import { useCreateImageMutation } from 'src/queries/images';
import { useGrants, useProfile } from 'src/queries/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

const useStyles = makeStyles((theme: Theme) => ({
  buttonGroup: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'flex-end',
    },
  },
  cloudInitCheckboxWrapper: {
    marginLeft: 3,
    marginTop: theme.spacing(2),
  },
  container: {
    '& .MuiFormHelperText-root': {
      marginBottom: theme.spacing(2),
    },
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(),
    paddingTop: theme.spacing(2),
  },
  diskAndPrice: {
    '& > div': {
      width: 415,
    },
  },
  helperText: {
    marginBottom: theme.spacing(),
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
    width: '80%',
  },
  rawDiskWarning: {
    maxWidth: 600,
    width: '100%',
  },
}));

const cloudInitTooltipMessage = (
  <Typography>
    Many Linode supported distributions are compatible with cloud-init by
    default, or you may have installed cloud-init.{' '}
    <Link to="https://www.linode.com/docs/products/compute/compute-instances/guides/metadata/">
      Learn more.
    </Link>
  </Typography>
);

export interface Props {
  changeDescription: (e: React.ChangeEvent<HTMLInputElement>) => void;
  changeIsCloudInit: () => void;
  changeLabel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  description?: string;
  isCloudInit?: boolean;
  label?: string;
}

export const CreateImageTab: React.FC<Props> = (props) => {
  const {
    changeDescription,
    changeIsCloudInit,
    changeLabel,
    description,
    isCloudInit,
    label,
  } = props;

  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { push } = useHistory();

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const flags = useFlags();

  const { mutateAsync: createImage } = useCreateImageMutation();

  const [selectedLinode, setSelectedLinode] = React.useState<Linode>();
  const [selectedDisk, setSelectedDisk] = React.useState<null | string>('');
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

  React.useEffect(() => {
    if (!selectedLinode) {
      return;
    }
    setSelectedDisk('');

    getLinodeDisks(selectedLinode.id)
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
  }, [selectedLinode]);

  const handleLinodeChange = (linode: Linode | null) => {
    if (linode !== null) {
      // Clear any errors
      setErrors(undefined);
    }
    setSelectedLinode(linode ?? undefined);
  };

  const handleDiskChange = (diskID: null | string) => {
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
      cloud_init: isCloudInit ? isCloudInit : undefined,
      description: safeDescription,
      diskID: Number(selectedDisk),
      label,
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

  const selectedDiskData: Disk | undefined = disks.find(
    (d) => `${d.id}` === selectedDisk
  );

  const isRawDisk = selectedDiskData?.filesystem === 'raw';
  const rawDiskWarning = (
    <Notice
      className={classes.rawDiskWarning}
      spacingBottom={32}
      spacingTop={16}
      variant="warning"
      text={rawDiskWarningText}
    />
  );

  const hasErrorFor = getAPIErrorFor(
    {
      disk_id: 'Disk',
      label: 'Label',
      linode_id: 'Linode',
      region: 'Region',
      size: 'Size',
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
          variant="error"
          text="You don't have permissions to create a new Image. Please contact an account administrator for details."
        />
      ) : null}
      {generalError ? (
        <Notice data-qa-notice variant="error" text={generalError} />
      ) : null}
      {notice ? <Notice data-qa-notice variant="info" text={notice} /> : null}

      <LinodeSelect
        optionsFilter={(linode) =>
          availableLinodesToImagize?.includes(linode.id) ?? true
        }
        disabled={!canCreateImage}
        errorText={linodeError}
        onSelectionChange={(linode) => handleLinodeChange(linode)}
        required
        value={selectedLinode?.id || null}
      />

      <Box
        alignItems="flex-end"
        className={classes.diskAndPrice}
        display="flex"
      >
        <DiskSelect
          data-qa-disk-select
          disabled={!canCreateImage}
          diskError={diskError}
          disks={disks}
          handleChange={handleDiskChange}
          required
          selectedDisk={selectedDisk}
          updateFor={[disks, selectedDisk, diskError, classes]}
        />
      </Box>
      {isRawDisk ? rawDiskWarning : null}
      {flags.metadata && (
        <Box className={classes.cloudInitCheckboxWrapper}>
          <Checkbox
            checked={isCloudInit}
            onChange={changeIsCloudInit}
            text="This image is cloud-init compatible"
            toolTipInteractive
            toolTipText={cloudInitTooltipMessage}
          />
        </Box>
      )}
      <>
        <TextField
          data-qa-image-label
          disabled={!canCreateImage}
          error={Boolean(labelError)}
          errorText={labelError}
          label="Label"
          onChange={changeLabel}
          value={label}
        />
        <TextField
          data-qa-image-description
          disabled={!canCreateImage}
          error={Boolean(descriptionError)}
          errorText={descriptionError}
          label="Description"
          multiline
          onChange={changeDescription}
          rows={1}
          value={description}
        />
      </>
      <Typography className={classes.helperText} variant="body1">
        Custom Images are billed at $0.10/GB per month.{' '}
        <Link to="https://www.linode.com/docs/products/tools/images/guides/capture-an-image/">
          Learn more about requirements and considerations.{' '}
        </Link>
        For information about how to check and clean a Linux system&rsquo;s disk
        space,{' '}
        <Link to="https://www.linode.com/docs/guides/check-and-clean-linux-disk-space/">
          read this guide.
        </Link>
      </Typography>
      <Box
        alignItems="center"
        className={classes.buttonGroup}
        display="flex"
        flexWrap="wrap"
        justifyContent="flex-end"
      >
        <Button
          buttonType="primary"
          data-qa-submit
          disabled={requirementsMet || !canCreateImage}
          loading={submitting}
          onClick={onSubmit}
        >
          Create Image
        </Button>
      </Box>
    </Paper>
  );
};

export default CreateImageTab;

const rawDiskWarningText =
  'Using a raw disk may fail, as Linode Images cannot be created from disks formatted with custom filesystems.';
