import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { Accordion } from 'src/components/Accordion';
import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import { Notice } from 'src/components/Notice/Notice';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { resetEventsPolling } from 'src/eventsPolling';
import {
  useLinodeDeleteMutation,
  useLinodeQuery,
} from 'src/queries/linodes/linodes';

interface Props {
  linodeId: number;
  isReadOnly?: boolean;
}

export const LinodeSettingsDeletePanel = ({ linodeId, isReadOnly }: Props) => {
  const { data: linode } = useLinodeQuery(linodeId);
  const {
    mutateAsync: deleteLinode,
    isLoading,
    error,
  } = useLinodeDeleteMutation(linodeId);

  const history = useHistory();

  const [open, setOpen] = React.useState<boolean>(false);

  const onDelete = async () => {
    await deleteLinode();
    resetEventsPolling();
    history.push('/linodes');
  };

  return (
    <React.Fragment>
      <Accordion heading="Delete Linode" defaultExpanded>
        <Button
          buttonType="primary"
          disabled={isReadOnly}
          onClick={() => setOpen(true)}
          style={{ marginBottom: 8 }}
          data-qa-delete-linode
        >
          Delete
        </Button>
        <Typography variant="body1">
          Deleting a Linode will result in permanent data loss.
        </Typography>
      </Accordion>
      <TypeToConfirmDialog
        title={`Delete ${linode?.label}?`}
        entity={{ type: 'Linode', label: linode?.label }}
        open={open}
        loading={isLoading}
        errors={error}
        onClose={() => setOpen(false)}
        onClick={onDelete}
      >
        <Notice warning>
          <Typography style={{ fontSize: '0.875rem' }}>
            <strong>Warning:</strong> Deleting your Linode will result in
            permanent data loss.
          </Typography>
        </Notice>
      </TypeToConfirmDialog>
    </React.Fragment>
  );
};
