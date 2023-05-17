import { APIError } from '@linode/api-v4/lib/types';
import { lensPath, set } from 'ramda';
import * as React from 'react';
import { useQueryClient } from 'react-query';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Accordion from 'src/components/Accordion';
import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import TypeToConfirmDialog from 'src/components/TypeToConfirmDialog';
import { resetEventsPolling } from 'src/eventsPolling';
import { withLinodeDetailContext } from 'src/features/linodes/LinodesDetail/linodeDetailContext';
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

  const queryClient = useQueryClient();

  const [open, setOpen] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);

  const _deleteLinode = () => {
    setSubmitting(true);

    deleteLinode({ linodeId, queryClient })
      .then(() => {
        resetEventsPolling();
        props.history.push('/linodes');
      })
      .catch((error: APIError[]) => {
        setErrors(set(lensPath(['errors']), error));
        scrollErrorIntoView();
      });
  };

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
      <TypeToConfirmDialog
        title={`Delete ${linodeLabel}?`}
        entity={{ type: 'Linode', label: linodeLabel }}
        open={open}
        loading={submitting}
        errors={errors}
        onClose={() => setOpen(false)}
        onClick={_deleteLinode}
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
