import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { compose } from 'recompose';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import TypeToConfirmDialog from 'src/components/TypeToConfirmDialog';

interface Props {
  linodeID?: number;
  linodeLabel?: string;
  open: boolean;
  onClose: () => void;
  handleDelete: (linodeID: number) => Promise<{}>;
}

type CombinedProps = Props;

const DeleteLinodeDialog: React.FC<CombinedProps> = (props) => {
  const { linodeID, linodeLabel, open, onClose, handleDelete } = props;

  const [isDeleting, setDeleting] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);

  React.useEffect(() => {
    if (open) {
      /**
       * reset error and loading states
       */
      setErrors(undefined);
      setDeleting(false);
    }
  }, [open]);

  const handleSubmit = () => {
    if (!linodeID) {
      return setErrors([{ reason: 'Something went wrong.' }]);
    }

    setDeleting(true);

    handleDelete(linodeID)
      .then(() => {
        onClose();
      })
      .catch((e) => {
        setErrors(e);
        setDeleting(false);
      });
  };

  return (
    <TypeToConfirmDialog
      title={`Delete ${linodeLabel}?`}
      entity={{ type: 'Linode', label: linodeLabel }}
      open={open}
      loading={isDeleting}
      errors={errors}
      onClose={onClose}
      onClick={handleSubmit}
    >
      <Notice warning>
        <Typography style={{ fontSize: '0.875rem' }}>
          <strong>Warning:</strong> Deleting your Linode will result in
          permanent data loss.
        </Typography>
      </Notice>
    </TypeToConfirmDialog>
  );
};

export default compose<CombinedProps, Props>(React.memo)(DeleteLinodeDialog);
