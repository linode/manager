import {
  ActionsPanel,
  Autocomplete,
  Button,
  Divider,
  FormHelperText,
  Notice,
  Select,
  SelectedIcon,
  Stack,
  TextField,
  Typography,
} from '@linode/ui';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { useFlags } from 'src/hooks/useFlags';

import { SESSION_STICKINESS_DEFAULTS } from './constants';
import { ActiveCheck } from './NodeBalancerActiveCheck';
import { NodeBalancerConfigNode } from './NodeBalancerConfigNode';
import { PassiveCheck } from './NodeBalancerPassiveCheck';
import {
  getAlgorithmOptions,
  getStickinessOptions,
  setErrorMap,
} from './utils';

import type { NodeBalancerConfigPanelProps } from './types';
import type {
  NodeBalancerConfigNodeMode,
  NodeBalancerProxyProtocol,
  Protocol,
} from '@linode/api-v4';

const DATA_NODE = 'data-node-idx';

export const NodeBalancerConfigPanel = (
  props: NodeBalancerConfigPanelProps
) => {
  const flags = useFlags();
  const {
    algorithm,
    configIdx,
    disabled,
    errors,
    forEdit,
    nodeMessage,
    nodes,
    onSave,
    port,
    privateKey,
    protocol,
    proxyProtocol,
    sessionStickiness,
    sslCertificate,
    submitting,
  } = props;

  const onPortChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    props.onPortChange(e.target.value);

  const onPrivateKeyChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    props.onPrivateKeyChange(e.target.value);

  const onProtocolChange = (
    event: React.SyntheticEvent,
    selected: { label: string; value: Protocol }
  ) => {
    const { healthCheckType } = props;
    const { value: protocol } = selected;

    props.onProtocolChange(selected.value);

    const newAlgorithmOptions = getAlgorithmOptions(selected.value);
    const newStickinessOptions = getStickinessOptions(selected.value);

    if (!newAlgorithmOptions.some((option) => option.value === algorithm)) {
      // If the newly selected protocol does not support the currently selected algorithm,
      // we reset the algorithm for the user.
      // For example if UDP is selected with "Ring Hash" then the user selects TCP, the algorithm
      // will change to "Round Robin" because TCP does not support Ring Hash.
      props.onAlgorithmChange(newAlgorithmOptions[0].value);
    }

    if (
      !newStickinessOptions.some((option) => option.value === sessionStickiness)
    ) {
      // If the newly selected protocol does not support the currently selected stickiness option,
      // we reset the stickiness selection for the user.
      // For example if UDP is selected with the "Session" stickiness option then the user selects TCP,
      // the stickiness will change to "None" because TCP does not support the "Session" stickiness option.
      props.onSessionStickinessChange(SESSION_STICKINESS_DEFAULTS[protocol]);
    }

    if (
      protocol === 'tcp' &&
      (healthCheckType === 'http' || healthCheckType === 'http_body')
    ) {
      props.onHealthCheckTypeChange('connection');
    }
    if (protocol === 'http' && healthCheckType === 'connection') {
      props.onHealthCheckTypeChange('http');
    }
    if (protocol === 'https' && healthCheckType === 'connection') {
      props.onHealthCheckTypeChange('http');
    }
  };

  const onSslCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    props.onSslCertificateChange(e.target.value);

  const onNodeLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nodeIdx = e.currentTarget.getAttribute(DATA_NODE);
    if (nodeIdx) {
      props.onNodeLabelChange(+nodeIdx, e.target.value);
    }
  };

  const onNodePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nodeIdx = e.currentTarget.getAttribute(DATA_NODE);
    if (nodeIdx) {
      props.onNodePortChange(+nodeIdx, e.target.value);
    }
  };

  const onNodeWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nodeIdx = e.currentTarget.getAttribute(DATA_NODE);
    if (nodeIdx) {
      props.onNodeWeightChange(+nodeIdx, e.target.value);
    }
  };

  const onNodeModeChange = (
    nodeIdx: number,
    mode: NodeBalancerConfigNodeMode
  ) => {
    props.onNodeModeChange!(nodeIdx, mode);
  };

  const addNode = () => {
    if (props.disabled) {
      return;
    }
    props.addNode();
  };

  const removeNode = (nodeIndex: number) => {
    if (props.disabled) {
      return;
    }
    const { removeNode } = props;
    if (removeNode) {
      return removeNode(nodeIndex);
    }
  };

  const errorMap = setErrorMap(errors || []);

  const globalFormError = errorMap.none;

  const protocolOptions = [
    { label: 'TCP', value: 'tcp' },
    { label: 'HTTP', value: 'http' },
    { label: 'HTTPS', value: 'https' },
    ...(flags.udp ? [{ label: 'UDP', value: 'udp' }] : []),
  ];

  const proxyProtocolOptions: {
    label: string;
    value: NodeBalancerProxyProtocol;
  }[] = [
    { label: 'None', value: 'none' },
    { label: 'v1', value: 'v1' },
    { label: 'v2', value: 'v2' },
  ];

  const defaultProtocol = protocolOptions.find((eachProtocol) => {
    return eachProtocol.value === protocol;
  });

  const selectedProxyProtocol = proxyProtocolOptions.find(
    (eachProxyProtocol) => {
      return eachProxyProtocol.value === proxyProtocol;
    }
  );

  const algOptions = getAlgorithmOptions(protocol);

  const defaultAlg = algOptions.find((eachAlg) => {
    return eachAlg.value === algorithm;
  });

  const sessionOptions = getStickinessOptions(protocol);

  const defaultSession = sessionOptions.find((eachSession) => {
    return eachSession.value === sessionStickiness;
  });

  const tcpSelected = protocol === 'tcp';

  return (
    <Grid data-qa-label-header size={12}>
      {globalFormError && (
        <Notice
          className={`error-for-scroll-${configIdx}`}
          text={globalFormError}
          variant="error"
        />
      )}
      <Grid container spacing={2}>
        <Grid
          size={{
            md: 3,
            xs: 6,
          }}
        >
          <TextField
            data-qa-port
            disabled={disabled}
            errorGroup={forEdit ? `${configIdx}` : undefined}
            errorText={errorMap.port || errorMap.configs}
            helperText="The unique inbound port that this NodeBalancer configuration will listen on."
            InputProps={{ id: `port-${configIdx}` }}
            label="Port"
            noMarginTop
            onChange={onPortChange}
            required
            type="number"
            value={port || ''}
          />
        </Grid>
        <Grid
          size={{
            md: 3,
            xs: 6,
          }}
        >
          <Select
            disabled={disabled}
            errorText={errorMap.protocol}
            helperText="Load balancing protocols: UDP and TCP (Layer 4); HTTP and HTTPS (Layer 7)."
            id={`protocol-${configIdx}`}
            label="Protocol"
            onChange={onProtocolChange}
            options={protocolOptions}
            textFieldProps={{
              noMarginTop: true,
              dataAttrs: {
                'data-qa-protocol-select': true,
              },
              errorGroup: forEdit ? `${configIdx}` : undefined,
            }}
            value={defaultProtocol || protocolOptions[0]}
          />
        </Grid>

        <Grid
          size={{
            md: 3,
            xs: 6,
          }}
        >
          <Autocomplete
            autoHighlight
            disableClearable
            disabled={disabled}
            errorText={errorMap.algorithm}
            helperText="Controls how new connections are allocated across backend nodes."
            id={`algorithm-${configIdx}`}
            label="Algorithm"
            noMarginTop
            onChange={(_, selected) => {
              props.onAlgorithmChange(selected.value);
            }}
            options={algOptions}
            renderOption={(props, option, state) => (
              <li {...props}>
                <Stack alignItems="center" direction="row" gap={1}>
                  <Stack>
                    <b>{option.label}</b>
                    {option.description}
                  </Stack>
                  {state.selected && <SelectedIcon />}
                </Stack>
              </li>
            )}
            size="small"
            textFieldProps={{
              dataAttrs: {
                'data-qa-algorithm-select': true,
              },
              errorGroup: forEdit ? `${configIdx}` : undefined,
            }}
            value={defaultAlg || algOptions[0]}
          />
        </Grid>

        <Grid
          size={{
            md: 3,
            xs: 6,
          }}
        >
          <Autocomplete
            autoHighlight
            disableClearable
            disabled={disabled}
            errorText={errorMap.stickiness}
            helperText="Routes subsequent requests from the client to the same backend."
            id={`session-stickiness-${configIdx}`}
            label="Session Stickiness"
            noMarginTop
            onChange={(_, selected) => {
              props.onSessionStickinessChange(selected.value);
            }}
            options={sessionOptions}
            renderOption={(props, option, state) => (
              <li {...props}>
                <Stack alignItems="center" direction="row" gap={1}>
                  <Stack>
                    <b>{option.label}</b>
                    {option.description}
                  </Stack>
                  {state.selected && <SelectedIcon />}
                </Stack>
              </li>
            )}
            size="small"
            textFieldProps={{
              dataAttrs: {
                'data-qa-session-stickiness-select': true,
              },
              errorGroup: forEdit ? `${configIdx}` : undefined,
            }}
            value={defaultSession || sessionOptions[1]}
          />
        </Grid>

        {tcpSelected && (
          <Grid
            size={{
              md: 6,
              xs: 12,
            }}
          >
            <Select
              disabled={disabled}
              errorText={errorMap.proxy_protocol}
              helperText={
                <>
                  Proxy Protocol preserves the initial TCP connection
                  information.{' '}
                  <Link to="https://techdocs.akamai.com/cloud-computing/docs/using-proxy-protocol-with-nodebalancers">
                    Learn more
                  </Link>
                  .
                </>
              }
              id={`proxy-protocol-${configIdx}`}
              label="Proxy Protocol"
              onChange={(_, selected) => {
                props.onProxyProtocolChange(selected.value);
              }}
              options={proxyProtocolOptions}
              textFieldProps={{
                noMarginTop: true,
                dataAttrs: {
                  'data-qa-proxy-protocol-select': true,
                },
                errorGroup: forEdit ? `${configIdx}` : undefined,
              }}
              value={selectedProxyProtocol || proxyProtocolOptions[0]}
            />
          </Grid>
        )}

        {protocol === 'https' && (
          <Grid container size={12} spacing={2}>
            <Grid
              size={{
                md: 6,
                xs: 12,
              }}
            >
              <TextField
                data-qa-cert-field
                data-testid="ssl-certificate"
                disabled={disabled}
                errorGroup={forEdit ? `${configIdx}` : undefined}
                errorText={errorMap.ssl_cert}
                expand
                label="SSL Certificate"
                multiline
                onChange={onSslCertificateChange}
                required={protocol === 'https'}
                rows={3}
                value={sslCertificate || ''}
              />
            </Grid>
            <Grid
              size={{
                md: 6,
                xs: 12,
              }}
            >
              <TextField
                data-qa-private-key-field
                data-testid="private-key"
                disabled={disabled}
                errorGroup={forEdit ? `${configIdx}` : undefined}
                errorText={errorMap.ssl_key}
                expand
                label="Private Key"
                multiline
                onChange={onPrivateKeyChange}
                required={protocol === 'https'}
                rows={3}
                value={privateKey || ''}
              />
            </Grid>
          </Grid>
        )}

        <Grid size={12}>
          <Divider />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <ActiveCheck errorMap={errorMap} {...props} />
        {protocol !== 'udp' && <PassiveCheck {...props} />}
        <Grid size={12}>
          <Divider />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Typography data-qa-backend-ip-header variant="h2">
            Backend Nodes
          </Typography>
          {nodeMessage && (
            <Grid size={12}>
              <Notice
                spacingBottom={0}
                spacingTop={8}
                text={nodeMessage}
                variant="info"
              />
            </Grid>
          )}
          {errorMap.nodes && (
            <FormHelperText error>{errorMap.nodes}</FormHelperText>
          )}
        </Grid>
        <Grid
          size={12}
          sx={{
            paddingBottom: '24px',
          }}
        >
          <Grid container spacing={2} sx={{ padding: 0 }}>
            {nodes?.map((node, nodeIdx) => (
              <NodeBalancerConfigNode
                configIdx={configIdx}
                disabled={Boolean(disabled)}
                disallowRemoval={!forEdit && nodeIdx === 0} // Prevent the user from removing the first node on the create flow.
                hideModeSelect={protocol === 'udp'} // UDP does not support the "mode" option on nodes
                idx={nodeIdx}
                key={`nb-node-${nodeIdx}`}
                node={node}
                nodeBalancerRegion={props.nodeBalancerRegion}
                onNodeAddressChange={props.onNodeAddressChange}
                onNodeLabelChange={onNodeLabelChange}
                onNodeModeChange={onNodeModeChange}
                onNodePortChange={onNodePortChange}
                onNodeWeightChange={onNodeWeightChange}
                removeNode={removeNode}
              />
            ))}
            <Grid size={12}>
              <Button
                buttonType="outlined"
                disabled={disabled}
                onClick={addNode}
              >
                Add a Node
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <React.Fragment>
        <Grid size={12}>
          <Divider />
        </Grid>
        <Grid
          container
          spacing={2}
          sx={{
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <StyledActionsPanel
            primaryButtonProps={
              forEdit
                ? {
                    'data-testid': 'save-config',
                    disabled,
                    label: 'Save',
                    loading: submitting,
                    onClick: onSave,
                  }
                : undefined
            }
            secondaryButtonProps={{
              'data-testid': 'delete-config',
              disabled,
              label: 'Delete',
              onClick: props.onDelete,
            }}
          />
        </Grid>
      </React.Fragment>
    </Grid>
  );
};

const StyledActionsPanel = styled(ActionsPanel, {
  label: 'StyledActionsPanel',
})(({ theme }) => ({
  paddingBottom: 0,
  paddingRight: `${theme.spacing()} !important`,
}));
