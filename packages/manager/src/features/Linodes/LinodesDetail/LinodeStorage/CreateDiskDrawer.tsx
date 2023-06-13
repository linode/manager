import { Disk, Linode } from '@linode/api-v4/lib/linodes';
import Grid from '@mui/material/Unstable_Grid2';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import { Item } from 'src/components/EnhancedSelect/Select';
import ModeSelect, { Mode } from 'src/components/ModeSelect';
import { Notice } from 'src/components/Notice/Notice';
import TextField from 'src/components/TextField';
import FormHelperText from 'src/components/core/FormHelperText';
import InputAdornment from 'src/components/core/InputAdornment';
import MenuItem from 'src/components/core/MenuItem';
import {
  useAllLinodeDisksQuery,
  useLinodeDiskCreateMutation,
} from 'src/queries/linodes/disks';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { getErrorMap } from 'src/utilities/errorUtils';
import ImageAndPassword from '../LinodeSettings/ImageAndPassword';
import { resetEventsPolling } from 'src/eventsPolling';

type FileSystem = 'raw' | 'swap' | 'ext3' | 'ext4' | 'initrd';

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
  open: boolean;
  onClose: () => void;
  linodeId: number;
}

export const CreateDiskDrawer = (props: Props) => {
  const { open, onClose, linodeId } = props;
  const { enqueueSnackbar } = useSnackbar();

  const [selectedMode, setSelectedMode] = React.useState<CreateMode>('empty');

  const { data: linode } = useLinodeQuery(linodeId);

  const { data: disks } = useAllLinodeDisksQuery(linodeId);

  const { mutateAsync: createDisk, error } = useLinodeDiskCreateMutation(
    linodeId
  );

  const maximumSize = calculateDiskFree(linode, disks, 0);

  const initialValues = {
    label: '',
    filesystem: 'ext4' as FileSystem,
    size: maximumSize,
    image: '',
    root_pass: '',
    authorized_users: [],
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    async onSubmit(values) {
      const cleanedValues =
        selectedMode === 'empty'
          ? {
              label: values.label,
              size: values.size,
              filesystem: values.filesystem,
            }
          : values;

      await createDisk(cleanedValues);
      resetEventsPolling();
      enqueueSnackbar(`Started creation of disk ${values.label}`, {
        variant: 'success',
      });
      onClose();
    },
  });

  const fields = Object.keys(initialValues) as (keyof typeof initialValues)[];

  const errorMap = getErrorMap(fields, error);

  React.useEffect(() => {
    if (open) {
      setSelectedMode('empty');
      formik.resetForm();
    }
  }, [open]);

  return (
    <Drawer title="Create Disk" open={open} onClose={onClose}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container direction="row">
          <Grid data-qa-mode-toggle>
            <ModeSelect
              modes={modeList}
              selected={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value as CreateMode)}
            />
          </Grid>
          <Grid xs={12}>
            {errorMap.none && (
              <Notice
                error
                spacingBottom={8}
                errorGroup="linode-disk-drawer"
                text={errorMap.none}
              />
            )}
          </Grid>
          <Grid xs={12}>
            <TextField
              label="Label"
              name="label"
              required
              value={formik.values.label}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              errorText={errorMap.label}
              errorGroup="linode-disk-drawer"
              data-qa-label
            />
            {selectedMode === 'empty' && (
              <TextField
                label="Filesystem"
                name="filesystem"
                select
                value={formik.values.filesystem}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                errorText={errorMap.filesystem}
              >
                <MenuItem value="_none_">
                  <em>Select a Filesystem</em>
                </MenuItem>
                {['raw', 'swap', 'ext3', 'ext4', 'initrd'].map((fs) => (
                  <MenuItem value={fs} key={fs}>
                    {fs}
                  </MenuItem>
                ))}
              </TextField>
            )}
            {selectedMode === 'from_image' && (
              <ImageAndPassword
                onImageChange={(selected: Item) =>
                  formik.setFieldValue('image', selected?.value ?? null)
                }
                imageFieldError={
                  formik.touched.image ? formik.errors.image : undefined
                }
                password={formik.values.root_pass}
                passwordError={errorMap.root_pass}
                onPasswordChange={(root_pass: string) =>
                  formik.setFieldValue('root_pass', root_pass)
                }
                authorizedUsers={formik.values.authorized_users}
                setAuthorizedUsers={(value) =>
                  formik.setFieldValue('authorized_users', value)
                }
              />
            )}
            <TextField
              label="Size"
              type="number"
              name="size"
              required
              value={formik.values.size}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              errorText={errorMap.size}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">MB</InputAdornment>
                ),
              }}
              data-qa-disk-size
            />
            <FormHelperText style={{ marginTop: 8 }}>
              Maximum size: {maximumSize} MB
            </FormHelperText>
          </Grid>
        </Grid>
        <ActionsPanel>
          <Button
            onClick={onClose}
            buttonType="secondary"
            className="cancel"
            data-qa-disk-cancel
          >
            Cancel
          </Button>
          <Button
            buttonType="primary"
            type="submit"
            loading={formik.isSubmitting}
            data-testid="submit-disk-form"
          >
            Create
          </Button>
        </ActionsPanel>
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
