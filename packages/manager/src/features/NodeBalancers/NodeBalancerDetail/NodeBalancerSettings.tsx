import { useTheme } from '@mui/material';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { Accordion } from 'src/components/Accordion';
import { Button } from 'src/components/Button/Button';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { FormHelperText } from 'src/components/FormHelperText';
import { InputAdornment } from 'src/components/InputAdornment';
import { TextField } from 'src/components/TextField';
import {
  useNodeBalancerQuery,
  useNodebalancerUpdateMutation,
} from 'src/queries/nodebalancers';
import { useNodeBalancersFirewallsQuery } from 'src/queries/nodebalancers';

import { NodeBalancerDeleteDialog } from '../NodeBalancerDeleteDialog';
import { NodeBalancerFirewalls } from './NodeBalancerFirewalls';

export const NodeBalancerSettings = () => {
  const theme = useTheme();
  const { nodeBalancerId } = useParams<{ nodeBalancerId: string }>();
  const id = Number(nodeBalancerId);
  const { data: nodebalancer } = useNodeBalancerQuery(id);
  const { data: attachedFirewallData } = useNodeBalancersFirewallsQuery(id);
  const displayFirewallInfoText = attachedFirewallData?.data ? true : false;

  const {
    error: labelError,
    isLoading: isUpdatingLabel,
    mutateAsync: updateNodeBalancerLabel,
  } = useNodebalancerUpdateMutation(id);

  const {
    error: throttleError,
    isLoading: isUpdatingThrottle,
    mutateAsync: updateNodeBalancerThrottle,
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

  const sxButton = {
    marginTop: theme.spacing(),
  };

  return (
    <div>
      <DocumentTitleSegment segment={`${nodebalancer.label} - Settings`} />
      <Accordion defaultExpanded heading="NodeBalancer Label">
        <TextField
          data-qa-label-panel
          errorText={labelError?.[0].reason}
          label="Label"
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Enter a label between 3 and 32 characters"
          value={label}
        />
        <Button
          buttonType="primary"
          data-qa-label-save
          disabled={label === nodebalancer.label}
          loading={isUpdatingLabel}
          onClick={() => updateNodeBalancerLabel({ label })}
          sx={sxButton}
        >
          Save
        </Button>
      </Accordion>
      <Accordion defaultExpanded heading="Firewalls">
        <NodeBalancerFirewalls
          displayFirewallInfoText={displayFirewallInfoText}
          nodeBalancerID={id}
        />
      </Accordion>
      <Accordion defaultExpanded heading="Client Connection Throttle">
        <TextField
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">/ second</InputAdornment>
            ),
          }}
          data-qa-connection-throttle
          errorText={throttleError?.[0].reason}
          label="Connection Throttle"
          onChange={(e) => setConnectionThrottle(Number(e.target.value))}
          placeholder="0"
          type="number"
          value={connectionThrottle}
        />
        <FormHelperText>
          To help mitigate abuse, throttle connections from a single client IP
          to this number per second. 0 to disable.
        </FormHelperText>
        <Button
          onClick={() =>
            updateNodeBalancerThrottle({
              client_conn_throttle: connectionThrottle,
            })
          }
          buttonType="primary"
          data-qa-label-save
          disabled={connectionThrottle === nodebalancer.client_conn_throttle}
          loading={isUpdatingThrottle}
          sx={sxButton}
        >
          Save
        </Button>
      </Accordion>
      <Accordion defaultExpanded heading="Delete NodeBalancer">
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
        onClose={() => setIsDeleteDialogOpen(false)}
        open={isDeleteDialogOpen}
      />
    </div>
  );
};

export default NodeBalancerSettings;
