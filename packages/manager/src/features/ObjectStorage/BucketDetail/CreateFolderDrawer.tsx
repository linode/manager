import { ActionsPanel, Drawer, TextField } from '@linode/ui';
import { useFormik } from 'formik';
import React, { useEffect } from 'react';

import { useCreateObjectUrlMutation } from 'src/queries/object-storage/queries';

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

  const { error, isPending, mutateAsync } = useCreateObjectUrlMutation(
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
        <ActionsPanel
          primaryButtonProps={{
            label: 'Create',
            loading: isPending,
            type: 'submit',
          }}
          secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
        />
      </form>
    </Drawer>
  );
};
