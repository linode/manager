import { useDeleteLinodeMutation, useLinodeQuery } from '@linode/queries';
import { Accordion, Button, Notice, Typography } from '@linode/ui';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useEventsPollingActions } from 'src/queries/events/events';

interface Props {
  isReadOnly?: boolean;
  linodeId: number;
}

export const LinodeSettingsDeletePanel = (props: Props) => {
  const { isReadOnly, linodeId } = props;
  const { data: linode } = useLinodeQuery(linodeId);
  const {
    error,
    isPending,
    mutateAsync: deleteLinode,
  } = useDeleteLinodeMutation(linodeId);

  const { checkForNewEvents } = useEventsPollingActions();

  const history = useHistory();

  const [open, setOpen] = React.useState<boolean>(false);

  const onDelete = async () => {
    await deleteLinode();
    checkForNewEvents();
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
        expand
        label={'Linode Label'}
        loading={isPending}
        onClick={onDelete}
        onClose={() => setOpen(false)}
        open={open}
        title={`Delete ${linode?.label}?`}
      >
        <Notice variant="warning">
          <Typography style={{ fontSize: '0.875rem' }}>
            <strong>Warning:</strong> Deleting your Linode will result in
            permanent data loss.
          </Typography>
        </Notice>
      </TypeToConfirmDialog>
    </React.Fragment>
  );
};
