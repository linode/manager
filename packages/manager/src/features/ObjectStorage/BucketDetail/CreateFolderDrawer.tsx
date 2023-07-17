import { useFormik } from 'formik';
import React, { useEffect } from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import Drawer from 'src/components/Drawer/Drawer';
import { TextField } from 'src/components/TextField';
import { useCreateObjectUrlMutation } from 'src/queries/objectStorage';

interface Props {
  bucketName: string;
  clusterId: string;
  maybeAddObjectToTable: (path: string, sizeInBytes: number) => void;
  onClose: () => void;
  open: boolean;
  prefix: string;
}

export const CreateFolderDrawer = (props: Props) => {
  const {
    bucketName,
    clusterId,
    maybeAddObjectToTable,
    onClose,
    open,
    prefix,
  } = props;

  const { error, isLoading, mutateAsync } = useCreateObjectUrlMutation(
    clusterId,
    bucketName
  );

  const formik = useFormik<{ name: string }>({
    initialValues: {
      name: '',
    },
    async onSubmit({ name }, helpers) {
      const newObjectAbsolutePath = prefix + name + '/';

      const { exists, url } = await mutateAsync({
        method: 'PUT',
        name: newObjectAbsolutePath,
        options: {
          content_type: 'application/octet-stream',
        },
      });

      if (exists) {
        helpers.setFieldError('name', 'This folder already exists.');
        return;
      }

      fetch(url, {
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        method: 'PUT',
      });

      maybeAddObjectToTable(newObjectAbsolutePath, 0);
      onClose();
    },
    validate(values) {
      if (values.name === '') {
        return {
          name: 'Folder name required.',
        };
      }
      return {};
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm();
    }
  }, [open]);

  return (
    <Drawer onClose={onClose} open={open} title="Create Folder">
      <form onSubmit={formik.handleSubmit}>
        <TextField
          errorText={formik.errors.name ?? error?.[0]?.reason}
          label="Folder Name"
          name="name"
          onChange={formik.handleChange}
        />
        <ActionsPanel>
          <Button buttonType="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button buttonType="primary" loading={isLoading} type="submit">
            Create
          </Button>
        </ActionsPanel>
      </form>
    </Drawer>
  );
};
