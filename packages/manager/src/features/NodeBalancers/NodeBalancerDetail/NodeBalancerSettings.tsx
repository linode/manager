import {
  useNodeBalancerQuery,
  useNodebalancerUpdateMutation,
} from '@linode/queries';
import {
  Accordion,
  Button,
  FormHelperText,
  InputAdornment,
  TextField,
} from '@linode/ui';
import { useTheme } from '@mui/material';
import { useMatch, useNavigate, useParams } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useDialogData } from 'src/hooks/useDialogData';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';

import { NodeBalancerDeleteDialog } from '../NodeBalancerDeleteDialog';
import { NodeBalancerFirewalls } from './NodeBalancerFirewalls';

export const NodeBalancerSettings = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const match = useMatch({
    strict: false,
  });
  const { id } = useParams({
    strict: false,
  });
  const { data: nodebalancer } = useNodeBalancerQuery(Number(id), Boolean(id));

  const isNodeBalancerReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'nodebalancer',
    id: nodebalancer?.id,
  });

  const {
    error: labelError,
    isPending: isUpdatingLabel,
    mutateAsync: updateNodeBalancerLabel,
  } = useNodebalancerUpdateMutation(Number(id));

  const {
    error: throttleError,
    isPending: isUpdatingThrottle,
    mutateAsync: updateNodeBalancerThrottle,
  } = useNodebalancerUpdateMutation(Number(id));

  const [label, setLabel] = React.useState(nodebalancer?.label);

  const [connectionThrottle, setConnectionThrottle] = React.useState(
    nodebalancer?.client_conn_throttle
  );

  const {
    data: selectedNodeBalancer,
    isFetching: isFetchingNodeBalancer,
  } = useDialogData({
    enabled: !!id,
    paramKey: 'id',
    queryHook: useNodeBalancerQuery,
    redirectToOnNotFound: '/nodebalancers',
  });

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
          disabled={isNodeBalancerReadOnly}
          errorText={labelError?.[0].reason}
          label="Label"
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Enter a label between 3 and 32 characters"
          value={label}
        />
        <Button
          buttonType="primary"
          data-qa-label-save
          disabled={isNodeBalancerReadOnly || label === nodebalancer.label}
          loading={isUpdatingLabel}
          onClick={() => updateNodeBalancerLabel({ label })}
          sx={sxButton}
        >
          Save
        </Button>
      </Accordion>
      <Accordion defaultExpanded heading="Firewalls">
        <NodeBalancerFirewalls nodeBalancerId={Number(id)} />
      </Accordion>
      <Accordion defaultExpanded heading="Client Connection Throttle">
        <TextField
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">/ second</InputAdornment>
            ),
          }}
          data-qa-connection-throttle
          disabled={isNodeBalancerReadOnly}
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
          onClick={() =>
            navigate({
              params: { id: String(id) },
              to: '/nodebalancers/$id/settings/delete',
            })
          }
          buttonType="primary"
          data-testid="delete-nodebalancer"
          disabled={isNodeBalancerReadOnly}
        >
          Delete
        </Button>
      </Accordion>
      <NodeBalancerDeleteDialog
        isFetching={isFetchingNodeBalancer}
        open={match.routeId === '/nodebalancers/$id/settings/delete'}
        selectedNodeBalancer={selectedNodeBalancer}
      />
    </div>
  );
};
