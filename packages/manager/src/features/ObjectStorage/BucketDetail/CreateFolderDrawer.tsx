import React from 'react';
import Drawer from 'src/components/Drawer/Drawer';
import TextField from 'src/components/TextField';
import { useFormik } from 'formik';
import { useCreateObjectUrlMutation } from 'src/queries/objectStorage';
import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import Notice from 'src/components/Notice';

interface Props {
  open: boolean;
  bucketName: string;
  clusterId: string;
  onClose: () => void;
  maybeAddObjectToTable: (path: string, sizeInBytes: number) => void;
}

export const CreateFolderDrawer = (props: Props) => {
  const { open, onClose, bucketName, clusterId, maybeAddObjectToTable } = props;

  const { mutateAsync, isLoading, error } = useCreateObjectUrlMutation(
    clusterId,
    bucketName
  );

  const formik = useFormik<{ name: string }>({
    initialValues: {
      name: '',
    },
    async onSubmit({ name }) {
      const { url } = await mutateAsync({
        name: `${name}/`,
        method: 'PUT',
        options: {
          content_type: 'application/octet-stream',
        },
      });

      await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      });

      maybeAddObjectToTable(`${name}/`, 0);
      onClose();
    },
  });

  return (
    <Drawer title="Create Folder" open={open} onClose={onClose}>
      {error && <Notice error text={error[0].reason} />}
      <form onSubmit={formik.handleSubmit}>
        <TextField
          label="Folder Name"
          name="name"
          onChange={formik.handleChange}
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
