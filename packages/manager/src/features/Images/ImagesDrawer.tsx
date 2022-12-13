import { Disk, getLinodeDisks } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { equals } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import TextField from 'src/components/TextField';
import { IMAGE_DEFAULT_LIMIT } from 'src/constants';
import { resetEventsPolling } from 'src/eventsPolling';
import DiskSelect from 'src/features/linodes/DiskSelect';
import LinodeSelect from 'src/features/linodes/LinodeSelect';
import { getGrantData, getProfileData } from 'src/queries/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import {
  useCreateImageMutation,
  useUpdateImageMutation,
} from 'src/queries/images';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  suffix: {
    fontSize: '.9rem',
    marginRight: theme.spacing(1),
  },
  actionPanel: {
    marginTop: theme.spacing(2),
  },
  helperText: {
    paddingTop: theme.spacing(1) / 2,
  },
}));

export interface Props {
  mode: DrawerMode;
  open: boolean;
  description?: string;
  imageId?: string;
  label?: string;
  // Only used from LinodeDisks to pre-populate the selected Disk
  disks?: Disk[];
  selectedDisk: string | null;
  onClose: () => void;
  changeDisk: (disk: string | null) => void;
  selectedLinode: number | null;
  changeLinode: (linodeId: number) => void;
  changeLabel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  changeDescription: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

type CombinedProps = Props & RouteComponentProps<{}> & WithSnackbarProps;

export type DrawerMode = 'closed' | 'create' | 'imagize' | 'restore' | 'edit';

const createImageText = 'Create Image';

const titleMap: Record<DrawerMode, string> = {
  closed: '',
  create: createImageText,
  imagize: createImageText,
  edit: 'Edit Image',
  restore: 'Restore from Image',
};

const buttonTextMap: Record<DrawerMode, string> = {
  closed: '',
  create: createImageText,
  restore: 'Restore Image',
  edit: 'Save Changes',
  imagize: createImageText,
};

export const ImageDrawer: React.FC<CombinedProps> = (props) => {
  const {
    mode,
    imageId,
    label,
    description,
    history,
    selectedDisk,
    selectedLinode,
    enqueueSnackbar,
    changeLabel,
    changeDescription,
    changeLinode,
    changeDisk,
    open,
    onClose,
  } = props;

  // console.log(label);
  // console.log(description);

  const classes = useStyles();

  const [mounted, setMounted] = React.useState<boolean>(false);
  const [notice, setNotice] = React.useState(undefined);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);

  const [disks, setDisks] = React.useState<Disk[]>([]);
  const [availableImages, setAvailableImages] = React.useState<number[] | null>(
    null
  );
  const [canCreateImage, setCanCreateImage] = React.useState<boolean>(false);

  const { mutateAsync: updateImage } = useUpdateImageMutation();
  const { mutateAsync: createImage } = useCreateImageMutation();

  React.useEffect(() => {
    setMounted(true);

    const profile = getProfileData();
    const grants = getGrantData();

    setCanCreateImage(
      Boolean(!profile?.restricted) || Boolean(grants?.global?.add_images)
    );

    // Unrestricted users can create Images from any disk;
    // Restricted users need read_write on the Linode they're trying to Imagize
    // (in addition to the global add_images grant).
    const images = profile?.restricted
      ? grants?.linode
          .filter((thisGrant) => thisGrant.permissions === 'read_write')
          .map((thisGrant) => thisGrant.id) ?? []
      : null;

    setAvailableImages(images);

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

  const handleDiskChange = (diskID: string | null) => {
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

  const safeDescription = description ?? ' ';

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

        updateImage({ imageId, label, description: safeDescription })
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
          diskID: Number(selectedDisk),
          label,
          description: safeDescription,
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
    <Drawer open={open} onClose={onClose} title={titleMap[mode]}>
      {!canCreateImage ? (
        <Notice
          error
          text="You don't have permissions to create a new Image. Please contact an account administrator for details."
        />
      ) : null}
      {generalError && <Notice error text={generalError} data-qa-notice />}

      {notice && <Notice success text={notice} data-qa-notice />}

      {['create', 'restore'].includes(mode) && (
        <LinodeSelect
          selectedLinode={selectedLinode}
          linodeError={linodeError}
          disabled={!canCreateImage}
          handleChange={(linode) => {
            if (linode !== null) {
              handleLinodeChange(linode.id);
            }
          }}
          filterCondition={(linode) =>
            availableImages ? availableImages.includes(linode.id) : true
          }
          updateFor={[
            selectedLinode,
            linodeError,
            classes,
            canCreateImage,
            availableImages,
          ]}
          isClearable={false}
        />
      )}

      {['create', 'imagize'].includes(mode) && (
        <>
          <DiskSelect
            selectedDisk={selectedDisk}
            disks={disks}
            diskError={diskError}
            handleChange={handleDiskChange}
            updateFor={[disks, selectedDisk, diskError, classes]}
            disabled={mode === 'imagize' || !canCreateImage}
            data-qa-disk-select
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
        </React.Fragment>
      )}

      <ActionsPanel
        style={{ marginTop: 16 }}
        updateFor={[requirementsMet, classes, submitting, mode]}
      >
        <Button
          onClick={close}
          buttonType="secondary"
          className="cancel"
          disabled={!canCreateImage}
          data-qa-cancel
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={requirementsMet || !canCreateImage}
          loading={submitting}
          buttonType="primary"
          data-qa-submit
        >
          {buttonTextMap[mode] ?? 'Submit'}
        </Button>
      </ActionsPanel>
    </Drawer>
  );
};

export default compose<CombinedProps, Props>(
  withRouter,
  withSnackbar,
  SectionErrorBoundary
)(ImageDrawer);
