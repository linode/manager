import { Disk, getLinodeDisks } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import { equals } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { IMAGE_DEFAULT_LIMIT } from 'src/constants';
import { resetEventsPolling } from 'src/eventsPolling';
import { DiskSelect } from 'src/features/Linodes/DiskSelect/DiskSelect';
import { LinodeSelect } from 'src/features/Linodes/LinodeSelect/LinodeSelect';
import {
  useCreateImageMutation,
  useUpdateImageMutation,
} from 'src/queries/images';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';

import { useImageAndLinodeGrantCheck } from './utils';

const useStyles = makeStyles((theme: Theme) => ({
  actionPanel: {
    marginTop: theme.spacing(2),
  },
  helperText: {
    paddingTop: theme.spacing(0.5),
  },
  root: {},
  suffix: {
    fontSize: '.9rem',
    marginRight: theme.spacing(1),
  },
}));

export interface Props {
  changeDescription: (e: React.ChangeEvent<HTMLInputElement>) => void;
  changeDisk: (disk: null | string) => void;
  changeLabel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  changeLinode: (linodeId: number) => void;
  description?: string;
  // Only used from LinodeDisks to pre-populate the selected Disk
  disks?: Disk[];
  imageId?: string;
  label?: string;
  mode: DrawerMode;
  onClose: () => void;
  open: boolean;
  selectedDisk: null | string;
  selectedLinode: null | number;
}

type CombinedProps = Props;

export type DrawerMode = 'closed' | 'create' | 'edit' | 'imagize' | 'restore';

const createImageText = 'Create Image';

const titleMap: Record<DrawerMode, string> = {
  closed: '',
  create: createImageText,
  edit: 'Edit Image',
  imagize: createImageText,
  restore: 'Restore from Image',
};

const buttonTextMap: Record<DrawerMode, string> = {
  closed: '',
  create: createImageText,
  edit: 'Save Changes',
  imagize: createImageText,
  restore: 'Restore Image',
};

export const ImagesDrawer = (props: CombinedProps) => {
  const {
    changeDescription,
    changeDisk,
    changeLabel,
    changeLinode,
    description,
    imageId,
    label,
    mode,
    onClose,
    open,
    selectedDisk,
    selectedLinode,
  } = props;

  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();
  const {
    canCreateImage,
    permissionedLinodes: availableLinodes,
  } = useImageAndLinodeGrantCheck();

  const [mounted, setMounted] = React.useState<boolean>(false);
  const [notice, setNotice] = React.useState(undefined);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);

  const [disks, setDisks] = React.useState<Disk[]>([]);

  const { mutateAsync: updateImage } = useUpdateImageMutation();
  const { mutateAsync: createImage } = useCreateImageMutation();

  React.useEffect(() => {
    setMounted(true);

    if (props.disks) {
      // for the 'imagizing' mode
      setDisks(props.disks);
    }

    return () => {
      setMounted(false);
    };
  }, [props.disks]);

  React.useEffect(() => {
    if (!selectedLinode) {
      setDisks([]);
    }

    if (selectedLinode) {
      getLinodeDisks(selectedLinode)
        .then((response) => {
          if (!mounted) {
            return;
          }

          const filteredDisks = response.data.filter(
            (disk) => disk.filesystem !== 'swap'
          );
          if (!equals(disks, filteredDisks)) {
            setDisks(filteredDisks);
          }
        })
        .catch((_) => {
          if (!mounted) {
            return;
          }

          if (mounted) {
            setErrors([
              {
                field: 'disk_id',
                reason: 'Could not retrieve disks for this Linode.',
              },
            ]);
          }
        });
    }
  }, [selectedLinode]);

  const handleLinodeChange = (linodeID: number) => {
    // Clear any errors
    setErrors(undefined);
    changeLinode(linodeID);
  };

  const handleDiskChange = (diskID: null | string) => {
    // Clear any errors
    setErrors(undefined);
    changeDisk(diskID);
  };

  const close = () => {
    onClose();
    if (mounted) {
      setErrors(undefined);
      setNotice(undefined);
      setSubmitting(false);
    }
  };

  const safeDescription = description ? description : ' ';

  const onSubmit = () => {
    setErrors(undefined);
    setNotice(undefined);
    setSubmitting(true);

    switch (mode) {
      case 'edit':
        if (!imageId) {
          setSubmitting(false);
          return;
        }

        updateImage({ description: safeDescription, imageId, label })
          .then(() => {
            if (!mounted) {
              return;
            }

            close();
          })
          .catch((errorResponse: APIError[]) => {
            if (!mounted) {
              return;
            }

            setSubmitting(false);
            setErrors(
              getAPIErrorOrDefault(errorResponse, 'Unable to edit Image')
            );
          });
        return;

      case 'create':
      case 'imagize':
        createImage({
          description: safeDescription,
          diskID: Number(selectedDisk),
          label,
        })
          .then(() => {
            if (!mounted) {
              return;
            }

            resetEventsPolling();

            setSubmitting(false);

            close();

            enqueueSnackbar('Image scheduled for creation.', {
              variant: 'info',
            });
          })
          .catch((errorResponse: APIError[]) => {
            if (!mounted) {
              return;
            }

            setSubmitting(false);
            setErrors(
              getAPIErrorOrDefault(
                errorResponse,
                'There was an error creating the image.'
              )
            );
          });
        return;

      case 'restore':
        if (!selectedLinode) {
          setSubmitting(false);
          setErrors([{ field: 'linode_id', reason: 'Choose a Linode.' }]);
          return;
        }
        close();
        history.push({
          pathname: `/linodes/${selectedLinode}/rebuild`,
          state: { selectedImageId: imageId },
        });
      default:
        return;
    }
  };

  const checkRequirements = () => {
    // When creating an image, disable the submit button until a Linode and
    // disk are selected. When restoring to an existing Linode, the Linode select is the only field.
    // When imagizing, the Linode is selected already so only check for a disk selection.
    const isDiskSelected = Boolean(selectedDisk);

    switch (mode) {
      case 'create':
        return !(isDiskSelected && selectedLinode);
      case 'imagize':
        return !isDiskSelected;
      case 'restore':
        return !selectedLinode;
      default:
        return false;
    }
  };

  const requirementsMet = checkRequirements();

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
    <Drawer onClose={onClose} open={open} title={titleMap[mode]}>
      {!canCreateImage ? (
        <Notice
          text="You don't have permissions to create a new Image. Please contact an account administrator for details."
          variant="error"
        />
      ) : null}
      {generalError && (
        <Notice data-qa-notice text={generalError} variant="error" />
      )}

      {notice && <Notice data-qa-notice text={notice} variant="info" />}

      {['create', 'restore'].includes(mode) && (
        <LinodeSelect
          onSelectionChange={(linode) => {
            if (linode !== null) {
              handleLinodeChange(linode.id);
            }
          }}
          optionsFilter={(linode) =>
            availableLinodes ? availableLinodes.includes(linode.id) : true
          }
          clearable={false}
          disabled={!canCreateImage}
          errorText={linodeError}
          value={selectedLinode}
        />
      )}

      {['create', 'imagize'].includes(mode) && (
        <>
          <DiskSelect
            data-qa-disk-select
            disabled={mode === 'imagize' || !canCreateImage}
            diskError={diskError}
            disks={disks}
            handleChange={handleDiskChange}
            selectedDisk={selectedDisk}
            updateFor={[disks, selectedDisk, diskError, classes]}
          />
          <Typography className={classes.helperText} variant="body1">
            Linode Images are limited to {IMAGE_DEFAULT_LIMIT} MB of data per
            disk by default. Please ensure that your disk content does not
            exceed this size limit, or open a Support ticket to request a higher
            limit. Additionally, Linode Images cannot be created if you are
            using raw disks or disks that have been formatted using custom
            filesystems.
          </Typography>
        </>
      )}

      {['create', 'edit', 'imagizing'].includes(mode) && (
        <React.Fragment>
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
        </React.Fragment>
      )}

      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'submit',
          disabled: requirementsMet || !canCreateImage,
          label: buttonTextMap[mode] ?? 'Submit',
          loading: submitting,
          onClick: onSubmit,
        }}
        secondaryButtonProps={{
          'data-testid': 'cancel',
          disabled: !canCreateImage,
          label: 'Cancel',
          onClick: close,
        }}
        updateFor={[
          requirementsMet,
          classes,
          submitting,
          mode,
          label,
          description,
        ]}
        style={{ marginTop: 16 }}
      />
    </Drawer>
  );
};
