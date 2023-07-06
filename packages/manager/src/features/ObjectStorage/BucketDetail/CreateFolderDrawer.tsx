import React, { useEffect } from 'react';
import Drawer from 'src/components/Drawer/Drawer';
import { TextField } from 'src/components/TextField';
import ActionsPanel from 'src/components/ActionsPanel';
import { useFormik } from 'formik';
import { useCreateObjectUrlMutation } from 'src/queries/objectStorage';
import { Button } from 'src/components/Button/Button';

interface Props {
  open: boolean;
  bucketName: string;
  clusterId: string;
  prefix: string;
  onClose: () => void;
  maybeAddObjectToTable: (path: string, sizeInBytes: number) => void;
}

export const CreateFolderDrawer = (props: Props) => {
  const {
    open,
    onClose,
    bucketName,
    clusterId,
    maybeAddObjectToTable,
    prefix,
  } = props;

  const { mutateAsync, isLoading, error } = useCreateObjectUrlMutation(
    clusterId,
    bucketName
  );

  const formik = useFormik<{ name: string }>({
    initialValues: {
      name: '',
    },
    validate(values) {
      if (values.name === '') {
        return {
          name: 'Folder name required.',
        };
      }
      return {};
    },
    async onSubmit({ name }, helpers) {
      const newObjectAbsolutePath = prefix + name + '/';

      const { url, exists } = await mutateAsync({
        name: newObjectAbsolutePath,
        method: 'PUT',
        options: {
          content_type: 'application/octet-stream',
        },
      });

      if (exists) {
        helpers.setFieldError('name', 'This folder already exists.');
        return;
      }

      fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      });

      maybeAddObjectToTable(newObjectAbsolutePath, 0);
      onClose();
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm();
    }
  }, [open]);

  return (
    <Drawer title="Create Folder" open={open} onClose={onClose}>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          label="Folder Name"
          name="name"
          onChange={formik.handleChange}
          errorText={formik.errors.name ?? error?.[0]?.reason}
        />
        <ActionsPanel>
          <Button buttonType="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" buttonType="primary" loading={isLoading}>
            Create
          </Button>
        </ActionsPanel>
      </form>
    </Drawer>
  );
};
