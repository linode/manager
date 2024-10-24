import {
  CreateLinodeDiskFromImageSchema,
  CreateLinodeDiskSchema,
} from '@linode/validation';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Drawer } from 'src/components/Drawer';
import { FormHelperText } from 'src/components/FormHelperText';
import { InputAdornment } from 'src/components/InputAdornment';
import { ModeSelect } from 'src/components/ModeSelect/ModeSelect';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { useEventsPollingActions } from 'src/queries/events/events';
import {
  useAllLinodeDisksQuery,
  useLinodeDiskCreateMutation,
} from 'src/queries/linodes/disks';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { handleAPIErrors } from 'src/utilities/formikErrorUtils';

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

  const { mutateAsync: createDisk, reset } = useLinodeDiskCreateMutation(
    linodeId
  );

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
            errorText={
              formik.touched.filesystem ? formik.errors.filesystem : undefined
            }
            onChange={(_, option) =>
              formik.setFieldValue('filesystem', option.label)
            }
            value={fileSystemOptions.find(
              (option) => option.label === formik.values.filesystem
            )}
            disableClearable
            label="Filesystem"
            onBlur={formik.handleBlur}
            options={fileSystemOptions}
          />
        )}
        {selectedMode === 'from_image' && (
          <ImageAndPassword
            imageFieldError={
              formik.touched.image ? formik.errors.image : undefined
            }
            onImageChange={(image: Image) =>
              formik.setFieldValue('image', image?.id ?? null)
            }
            onPasswordChange={(root_pass: string) =>
              formik.setFieldValue('root_pass', root_pass)
            }
            passwordError={
              formik.touched.root_pass ? formik.errors.root_pass : undefined
            }
            setAuthorizedUsers={(value) =>
              formik.setFieldValue('authorized_users', value)
            }
            authorizedUsers={formik.values.authorized_users}
            linodeId={linodeId}
            password={formik.values.root_pass}
            selectedImage={formik.values.image}
          />
        )}
        <TextField
          InputProps={{
            endAdornment: <InputAdornment position="end">MB</InputAdornment>,
          }}
          data-qa-disk-size
          errorText={formik.touched.size ? formik.errors.size : undefined}
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
