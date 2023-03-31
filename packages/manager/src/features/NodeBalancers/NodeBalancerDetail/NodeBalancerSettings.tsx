import * as React from 'react';
import Accordion from 'src/components/Accordion';
import Button from 'src/components/Button';
import FormHelperText from 'src/components/core/FormHelperText';
import InputAdornment from 'src/components/core/InputAdornment';
import TextField from 'src/components/TextField';
import defaultNumeric from 'src/utilities/defaultNumeric';
import { useParams } from 'react-router-dom';
import { clamp, compose, defaultTo } from 'ramda';
import { Theme } from '@mui/material/styles';
import { NodeBalancerDeleteDialog } from '../NodeBalancerDeleteDialog';
import { makeStyles } from 'tss-react/mui';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import {
  useNodeBalancerQuery,
  useNodebalancerUpdateMutation,
} from 'src/queries/nodebalancers';

const useStyles = makeStyles()((theme: Theme) => ({
  spacing: {
    marginTop: theme.spacing(),
  },
}));

export const NodeBalancerSettings = () => {
  const { classes } = useStyles();
  const { nodeBalancerId } = useParams<{ nodeBalancerId: string }>();
  const id = Number(nodeBalancerId);

  const { data: nodebalancer } = useNodeBalancerQuery(id);

  const {
    mutateAsync: updateNodeBalancerLabel,
    error: labelError,
    isLoading: isUpdatingLabel,
  } = useNodebalancerUpdateMutation(id);

  const {
    mutateAsync: updateNodeBalancerThrottle,
    error: throttleError,
    isLoading: isUpdatingThrottle,
  } = useNodebalancerUpdateMutation(id);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState<boolean>(
    false
  );

  const [label, setLabel] = React.useState(nodebalancer?.label);

  const [connectionThrottle, setConnectionThrottle] = React.useState(
    nodebalancer?.client_conn_throttle
  );

  React.useEffect(() => {
    if (label !== nodebalancer?.label) {
      setLabel(nodebalancer?.label);
    }
    if (connectionThrottle !== nodebalancer?.client_conn_throttle) {
      setConnectionThrottle(nodebalancer?.client_conn_throttle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodebalancer]);

  if (!nodebalancer) {
    return null;
  }

  return (
    <div>
      <DocumentTitleSegment segment={`${nodebalancer.label} - Settings`} />
      <Accordion heading="NodeBalancer Label" defaultExpanded>
        <TextField
          label="Label"
          placeholder="Enter a label between 3 and 32 characters"
          errorText={labelError?.[0].reason}
          onChange={(e) => setLabel(e.target.value)}
          value={label}
          data-qa-label-panel
        />
        <Button
          buttonType="primary"
          className={classes.spacing}
          loading={isUpdatingLabel}
          disabled={label === nodebalancer.label}
          onClick={() => updateNodeBalancerLabel({ label })}
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
          errorText={throttleError?.[0].reason}
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
          loading={isUpdatingThrottle}
          disabled={connectionThrottle === nodebalancer.client_conn_throttle}
          onClick={() =>
            updateNodeBalancerThrottle({
              client_conn_throttle: connectionThrottle,
            })
          }
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
      <NodeBalancerDeleteDialog
        id={nodebalancer.id}
        label={nodebalancer?.label}
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};

const controlClientConnectionThrottle = compose(clamp(0, 20), (value: string) =>
  defaultNumeric(0, value)
);

export default NodeBalancerSettings;
