import {
  useAllLinodeDisksQuery,
  useLinodeDiskCreateMutation,
  useLinodeQuery,
} from '@linode/queries';
import {
  ActionsPanel,
  Autocomplete,
  Drawer,
  FormHelperText,
  InputAdornment,
  Notice,
  TextField,
} from '@linode/ui';
import {
  CreateLinodeDiskFromImageSchema,
  CreateLinodeDiskSchema,
} from '@linode/validation';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ModeSelect } from 'src/components/ModeSelect/ModeSelect';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { useEventsPollingActions } from 'src/queries/events/events';
import { handleAPIErrors } from 'src/utilities/formikErrorUtils';

import { LinodePermissionsError } from '../LinodePermissionsError';
import { ImageAndPassword } from '../LinodeSettings/ImageAndPassword';

import type { Image } from '@linode/api-v4';
import type { Disk, Linode } from '@linode/api-v4/lib/linodes';
import type { Mode } from 'src/components/ModeSelect/ModeSelect';

type FileSystem = 'ext3' | 'ext4' | 'initrd' | 'raw' | 'swap';

type CreateMode = 'empty' | 'from_image';

const modeList: Mode<CreateMode>[] = [
  {
    label: 'Create Empty Disk',
    mode: 'empty',
  },
  {
    label: 'Create from Image',
    mode: 'from_image',
  },
];

export interface Props {
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

export const CreateDiskDrawer = (props: Props) => {
  const { linodeId, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { checkForNewEvents } = useEventsPollingActions();

  const [selectedMode, setSelectedMode] = React.useState<CreateMode>('empty');

  const { data: linode } = useLinodeQuery(linodeId, open);

  const { data: disks } = useAllLinodeDisksQuery(linodeId, open);

  const disabled = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'linode',
    id: linodeId,
  });

  const { mutateAsync: createDisk, reset } =
    useLinodeDiskCreateMutation(linodeId);

  const maximumSize = calculateDiskFree(linode, disks, 0);

  const initialValues = {
    authorized_users: [],
    filesystem: 'ext4' as FileSystem,
    image: '',
    label: '',
    root_pass: '',
    size: maximumSize,
  };

  const validationSchema =
    selectedMode === 'from_image'
      ? CreateLinodeDiskFromImageSchema
      : CreateLinodeDiskSchema;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    async onSubmit(values, helpers) {
      try {
        const cleanedValues =
          selectedMode === 'empty'
            ? {
                filesystem: values.filesystem,
                label: values.label,
                size: values.size,
              }
            : values;

        await createDisk(cleanedValues);
        checkForNewEvents();
        enqueueSnackbar(`Started creation of disk ${values.label}`, {
          variant: 'success',
        });
        onClose();
      } catch (e) {
        handleAPIErrors(e, helpers.setFieldError, helpers.setStatus);
      }
    },
    validationSchema,
  });

  React.useEffect(() => {
    if (open) {
      setSelectedMode('empty');
      formik.resetForm();
      reset();
    }
  }, [open]);

  const fileSystemOptions = [
    { label: 'raw' },
    { label: 'swap' },
    { label: 'ext3' },
    { label: 'ext4' },
    { label: 'initrd' },
  ];

  return (
    <Drawer onClose={onClose} open={open} title="Create Disk">
      <form onSubmit={formik.handleSubmit}>
        {disabled && <LinodePermissionsError />}
        <ModeSelect
          modes={modeList}
          onChange={(e) => setSelectedMode(e.target.value as CreateMode)}
          selected={selectedMode}
        />
        {formik.status && (
          <Notice
            errorGroup="linode-disk-drawer"
            spacingBottom={8}
            text={formik.status}
            variant="error"
          />
        )}
        <TextField
          data-qa-label
          disabled={disabled}
          errorGroup="linode-disk-drawer"
          errorText={formik.touched.label ? formik.errors.label : undefined}
          label="Label"
          name="label"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          required
          value={formik.values.label}
        />
        {selectedMode === 'empty' && (
          <Autocomplete
            disableClearable
            disabled={disabled}
            errorText={
              formik.touched.filesystem ? formik.errors.filesystem : undefined
            }
            label="Filesystem"
            onBlur={formik.handleBlur}
            onChange={(_, option) =>
              formik.setFieldValue('filesystem', option.label)
            }
            options={fileSystemOptions}
            value={fileSystemOptions.find(
              (option) => option.label === formik.values.filesystem
            )}
          />
        )}
        {selectedMode === 'from_image' && (
          <ImageAndPassword
            authorizedUsers={formik.values.authorized_users}
            disabled={Boolean(disabled)}
            imageFieldError={
              formik.touched.image ? formik.errors.image : undefined
            }
            onImageChange={(image: Image) =>
              formik.setFieldValue('image', image?.id ?? null)
            }
            onPasswordChange={(root_pass: string) =>
              formik.setFieldValue('root_pass', root_pass)
            }
            password={formik.values.root_pass}
            passwordError={
              formik.touched.root_pass ? formik.errors.root_pass : undefined
            }
            selectedImage={formik.values.image}
            setAuthorizedUsers={(value) =>
              formik.setFieldValue('authorized_users', value)
            }
          />
        )}
        <TextField
          data-qa-disk-size
          disabled={disabled}
          errorText={formik.touched.size ? formik.errors.size : undefined}
          InputProps={{
            endAdornment: <InputAdornment position="end">MB</InputAdornment>,
          }}
          label="Size"
          name="size"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          required
          type="number"
          value={formik.values.size}
        />
        <FormHelperText style={{ marginTop: 8 }}>
          Maximum size: {maximumSize} MB
        </FormHelperText>
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit-disk-form',
            disabled,
            label: 'Create',
            loading: formik.isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />
      </form>
    </Drawer>
  );
};

export const calculateDiskFree = (
  linode: Linode | undefined,
  disks: Disk[] | undefined,
  diskId: number
): number => {
  if (!linode || !disks) {
    return 0;
  }
  return (
    linode.specs.disk -
    disks.reduce((acc: number, disk: Disk) => {
      return diskId === disk.id ? acc : acc + disk.size;
    }, 0)
  );
};
