import { clamp, compose, defaultTo } from 'ramda';
import * as React from 'react';
import { compose as composeC } from 'recompose';
import Accordion from 'src/components/Accordion';
import Button from 'src/components/Button';
import FormHelperText from 'src/components/core/FormHelperText';
import InputAdornment from 'src/components/core/InputAdornment';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import TextField from 'src/components/TextField';
import defaultNumeric from 'src/utilities/defaultNumeric';
import {
  getAPIErrorOrDefault,
  getErrorStringOrDefault,
} from 'src/utilities/errorUtils';
import {
  withNodeBalancerActions,
  WithNodeBalancerActions,
} from 'src/store/nodeBalancer/nodeBalancer.containers';
import { NodeBalancer } from '@linode/api-v4/lib/nodebalancers';
import { APIError } from '@linode/api-v4/lib/types';
import { useHistory } from 'react-router-dom';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import ActionsPanel from 'src/components/ActionsPanel';
import Notice from 'src/components/Notice';

const useStyles = makeStyles((theme: Theme) => ({
  spacing: {
    marginTop: theme.spacing(),
  },
  notice: {
    '& p': {
      fontFamily: theme.font.normal,
      fontSize: '0.875rem',
    },
  },
}));

interface Props {
  nodeBalancerId: number;
  nodeBalancerLabel: string;
  nodeBalancerClientConnThrottle: number;
  updateNodeBalancerDetailState: (data: NodeBalancer) => void;
}

type CombinedProps = Props & WithNodeBalancerActions;

export const NodeBalancerSettings: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const history = useHistory();

  const {
    nodeBalancerId,
    nodeBalancerLabel,
    nodeBalancerClientConnThrottle,
    nodeBalancerActions: { updateNodeBalancer, deleteNodeBalancer },
    updateNodeBalancerDetailState,
  } = props;

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState<boolean>(
    false
  );
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);
  const [deleteError, setDeleteError] = React.useState<APIError[] | undefined>(
    undefined
  );

  const [label, setLabel] = React.useState<string>(props.nodeBalancerLabel);
  const [isLabelSaving, setIsLabelSaving] = React.useState<boolean>(false);
  const [labelError, setLabelError] = React.useState<string | undefined>(
    undefined
  );

  const [connectionThrottle, setConnectionThrottle] = React.useState<number>(
    nodeBalancerClientConnThrottle
  );
  const [
    isConnectionThrottleSaving,
    setIsConnectionThrottleSaving,
  ] = React.useState<boolean>(false);
  const [connectionThrottleError, setConnectionThrottleError] = React.useState<
    string | undefined
  >(undefined);

  React.useEffect(() => {
    if (label !== props.nodeBalancerLabel) {
      setLabel(props.nodeBalancerLabel);
    }
    if (connectionThrottle !== props.nodeBalancerClientConnThrottle) {
      setConnectionThrottle(props.nodeBalancerClientConnThrottle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);

  const onSaveLabel = () => {
    setIsLabelSaving(true);
    setLabelError(undefined);

    updateNodeBalancer({ nodeBalancerId, label })
      .then((data) => {
        setIsLabelSaving(false);
        updateNodeBalancerDetailState(data);
      })
      .catch((error) => {
        setIsLabelSaving(false);
        setLabelError(
          getAPIErrorOrDefault(
            error,
            'Unable to update your NodeBalancer\u{2019}s label.'
          )[0].reason
        );
      });
  };

  const onSaveConnectionThrottle = () => {
    setIsConnectionThrottleSaving(true);
    setConnectionThrottleError(undefined);

    updateNodeBalancer({
      nodeBalancerId,
      client_conn_throttle: connectionThrottle,
    })
      .then((data) => {
        setIsConnectionThrottleSaving(false);
        updateNodeBalancerDetailState(data);
      })
      .catch((error) => {
        setIsConnectionThrottleSaving(false);
        setLabelError(
          getAPIErrorOrDefault(
            error,
            'Unable to update your NodeBalancer\u{2019}s client connection throttle.'
          )[0].reason
        );
      });
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setDeleteError(undefined);

    deleteNodeBalancer({ nodeBalancerId })
      .then(() => {
        history.replace('/nodebalancers');
      })
      .catch((errors: APIError[]) => {
        setDeleteError(errors);
        setIsDeleting(false);
      });
  };

  const actions = (
    <ActionsPanel>
      <Button
        buttonType="secondary"
        onClick={() => setIsDeleteDialogOpen(false)}
      >
        Cancel
      </Button>
      <Button buttonType="primary" onClick={handleDelete} loading={isDeleting}>
        Delete NodeBalancer
      </Button>
    </ActionsPanel>
  );

  return (
    <div>
      <DocumentTitleSegment segment={`${nodeBalancerLabel} - Settings`} />
      <Accordion heading="NodeBalancer Label" defaultExpanded>
        <TextField
          label="Label"
          placeholder="Enter a label between 3 and 32 characters"
          errorText={labelError}
          onChange={(e) => setLabel(e.target.value)}
          value={label}
          data-qa-label-panel
        />
        <Button
          buttonType="primary"
          className={classes.spacing}
          loading={isLabelSaving}
          disabled={label === nodeBalancerLabel}
          onClick={onSaveLabel}
          data-qa-label-save
        >
          Save
        </Button>
      </Accordion>
      <Accordion heading="Client Connection Throttle" defaultExpanded>
        <TextField
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">/ second</InputAdornment>
            ),
          }}
          label="Connection Throttle"
          errorText={connectionThrottleError}
          onChange={(e) =>
            setConnectionThrottle(
              controlClientConnectionThrottle(e.target.value)
            )
          }
          placeholder="0"
          value={defaultTo(0, connectionThrottle)}
          data-qa-connection-throttle
        />
        <FormHelperText>
          To help mitigate abuse, throttle connections from a single client IP
          to this number per second. 0 to disable.
        </FormHelperText>
        <Button
          buttonType="primary"
          className={classes.spacing}
          loading={isConnectionThrottleSaving}
          disabled={connectionThrottle === props.nodeBalancerClientConnThrottle}
          onClick={onSaveConnectionThrottle}
          data-qa-label-save
        >
          Save
        </Button>
      </Accordion>
      <Accordion heading="Delete NodeBalancer" defaultExpanded>
        <Button
          buttonType="primary"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          Delete
        </Button>
      </Accordion>
      <ConfirmationDialog
        title={`Delete NodeBalancer ${label}?`}
        open={isDeleteDialogOpen}
        error={
          deleteError && deleteError.length > 0
            ? getErrorStringOrDefault(
                deleteError,
                'Unable to delete this NodeBalancer.'
              )
            : undefined
        }
        onClose={() => setIsDeleteDialogOpen(false)}
        actions={actions}
      >
        <Notice warning className={classes.notice}>
          Deleting this NodeBalancer is permanent and can’t be undone.
        </Notice>
        <Typography variant="body1">
          Traffic will no longer be routed through this NodeBalancer. Please
          check your DNS settings and either provide the IP address of another
          active NodeBalancer, or route traffic directly to your Linode.
        </Typography>
      </ConfirmationDialog>
    </div>
  );
};

const controlClientConnectionThrottle = compose(clamp(0, 20), (value: string) =>
  defaultNumeric(0, value)
);

const enhanced = composeC<CombinedProps, Props>(withNodeBalancerActions);

export default enhanced(NodeBalancerSettings);
