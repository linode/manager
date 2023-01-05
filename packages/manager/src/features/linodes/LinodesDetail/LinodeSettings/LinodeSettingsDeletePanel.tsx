import { APIError } from '@linode/api-v4/lib/types';
import { lensPath, set } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Accordion from 'src/components/Accordion';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import TypeToConfirm from 'src/components/TypeToConfirm';
import { resetEventsPolling } from 'src/eventsPolling';
import { withLinodeDetailContext } from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import usePreferences from 'src/hooks/usePreferences';
import {
  LinodeActionsProps,
  withLinodeActions,
} from 'src/store/linodes/linode.containers';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

interface Props {
  linodeId: number;
  linodeLabel: string;
}

type CombinedProps = Props &
  ContextProps &
  LinodeActionsProps &
  RouteComponentProps<{}>;

export const LinodeSettingsDeletePanel: React.FC<CombinedProps> = (props) => {
  const {
    linodeId,
    linodeLabel,
    linodeActions: { deleteLinode },
    readOnly,
  } = props;

  const [open, setOpen] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);
  const [confirmText, setConfirmText] = React.useState('');

  const { preferences } = usePreferences();
  const disabled =
    preferences?.type_to_confirm !== false && confirmText !== linodeLabel;

  const _deleteLinode = () => {
    setSubmitting(true);

    deleteLinode({ linodeId })
      .then(() => {
        resetEventsPolling();
        props.history.push('/linodes');
      })
      .catch((error: APIError[]) => {
        setErrors(set(lensPath(['errors']), error));
        scrollErrorIntoView();
      });
  };

  const renderConfirmationActions = () => (
    <ActionsPanel>
      <Button
        buttonType="secondary"
        onClick={() => setOpen(false)}
        data-qa-cancel-delete
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        loading={submitting}
        disabled={disabled}
        onClick={_deleteLinode}
        data-qa-confirm-delete
      >
        Delete
      </Button>
    </ActionsPanel>
  );

  return (
    <React.Fragment>
      <Accordion heading="Delete Linode" defaultExpanded>
        <Button
          buttonType="primary"
          disabled={readOnly}
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
      <ConfirmationDialog
        title={`Delete ${linodeLabel}?`}
        actions={renderConfirmationActions}
        open={open}
        onClose={() => setOpen(false)}
        error={errors ? errors[0].reason : undefined}
      >
        <Notice warning>
          <Typography style={{ fontSize: '0.875rem' }}>
            <strong>Warning:</strong> Deleting your Linode will result in
            permanent data loss.
          </Typography>
        </Notice>
        <TypeToConfirm
          label="Linode Label"
          confirmationText={
            <span>
              To confirm deletion, type the name of the Linode (
              <b>{linodeLabel}</b>) in the field below:
            </span>
          }
          value={confirmText}
          data-testid={'dialog-confirm-text-input'}
          expand
          onChange={(input) => {
            setConfirmText(input);
          }}
          visible={preferences?.type_to_confirm}
        />
      </ConfirmationDialog>
    </React.Fragment>
  );
};

const errorBoundary = PanelErrorBoundary({ heading: 'Delete Linode' });

interface ContextProps {
  readOnly: boolean;
}

const linodeContext = withLinodeDetailContext<ContextProps>(({ linode }) => ({
  readOnly: linode._permissions === 'read_only',
}));

const enhanced = compose<CombinedProps, Props>(
  errorBoundary,
  linodeContext,
  withRouter,
  withLinodeActions
);

export default enhanced(
  LinodeSettingsDeletePanel
) as React.ComponentType<Props>;
