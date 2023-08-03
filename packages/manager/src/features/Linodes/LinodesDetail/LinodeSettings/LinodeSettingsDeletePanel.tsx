import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Accordion } from 'src/components/Accordion';
import { Button } from 'src/components/Button/Button';
import { Notice } from 'src/components/Notice/Notice';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { Typography } from 'src/components/Typography';
import { resetEventsPolling } from 'src/eventsPolling';
import {
  useDeleteLinodeMutation,
  useLinodeQuery,
} from 'src/queries/linodes/linodes';

interface Props {
  isReadOnly?: boolean;
  linodeId: number;
}

export const LinodeSettingsDeletePanel = (props: Props) => {
  const { isReadOnly, linodeId } = props;
  const { data: linode } = useLinodeQuery(linodeId);
  const {
    error,
    isLoading,
    mutateAsync: deleteLinode,
  } = useDeleteLinodeMutation(linodeId);

  const history = useHistory();

  const [open, setOpen] = React.useState<boolean>(false);

  const onDelete = async () => {
    await deleteLinode();
    resetEventsPolling();
    history.push('/linodes');
  };

  return (
    <React.Fragment>
      <Accordion defaultExpanded heading="Delete Linode">
        <Button
          buttonType="primary"
          data-qa-delete-linode
          disabled={isReadOnly}
          onClick={() => setOpen(true)}
          style={{ marginBottom: 8 }}
        >
          Delete
        </Button>
        <Typography variant="body1">
          Deleting a Linode will result in permanent data loss.
        </Typography>
      </Accordion>
      <TypeToConfirmDialog
        entity={{
          action: 'deletion',
          name: linode?.label,
          primaryBtnText: 'Delete',
          type: 'Linode',
        }}
        errors={error}
        label={'Linode Label'}
        loading={isLoading}
        onClick={onDelete}
        onClose={() => setOpen(false)}
        open={open}
        title={`Delete ${linode?.label}?`}
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
