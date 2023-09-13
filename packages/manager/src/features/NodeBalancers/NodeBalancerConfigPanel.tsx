import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { Divider } from 'src/components/Divider';
import Select from 'src/components/EnhancedSelect/Select';
import { FormHelperText } from 'src/components/FormHelperText';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';

import { ActiveCheck } from './NodeBalancerActiveCheck';
import { NodeBalancerConfigNode } from './NodeBalancerConfigNode';
import { PassiveCheck } from './NodeBalancerPassiveCheck';
import { setErrorMap } from './utils';

import type { NodeBalancerConfigPanelProps } from './types';
import type { Item } from 'src/components/EnhancedSelect/Select';

const DATA_NODE = 'data-node-idx';

export const NodeBalancerConfigPanel = (
  props: NodeBalancerConfigPanelProps
) => {
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

  const onAlgorithmChange = (e: Item<string>) =>
    props.onAlgorithmChange(e.value);

  const onPortChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    props.onPortChange(e.target.value);

  const onPrivateKeyChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    props.onPrivateKeyChange(e.target.value);

  const onProtocolChange = (e: Item<string>) => {
    const { healthCheckType } = props;
    const { value: protocol } = e;

    props.onProtocolChange(e.value);

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

  const onProxyProtocolChange = (e: Item<string>) => {
    props.onProxyProtocolChange(e.value);
  };

  const onSessionStickinessChange = (e: Item<string>) =>
    props.onSessionStickinessChange(e.value);

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
    e: React.ChangeEvent<HTMLInputElement>,
    nodeIdx: number
  ) => {
    props.onNodeModeChange!(nodeIdx, e.target.value);
  };

  const addNode = () => {
    if (props.disabled) {
      return;
    }
    props.addNode();
  };

  const removeNode = (e: React.MouseEvent<HTMLElement>) => {
    if (props.disabled) {
      return;
    }
    const nodeIdx: null | string = e.currentTarget.getAttribute(DATA_NODE);
    const { removeNode } = props;
    if (removeNode && nodeIdx) {
      return removeNode(+nodeIdx);
    }
  };

  const errorMap = setErrorMap(errors || []);

  const globalFormError = errorMap.none;

  const protocolOptions = [
    { label: 'TCP', value: 'tcp' },
    { label: 'HTTP', value: 'http' },
    { label: 'HTTPS', value: 'https' },
  ];

  const proxyProtocolOptions = [
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

  const algOptions = [
    { label: 'Round Robin', value: 'roundrobin' },
    { label: 'Least Connections', value: 'leastconn' },
    { label: 'Source', value: 'source' },
  ];

  const defaultAlg = algOptions.find((eachAlg) => {
    return eachAlg.value === algorithm;
  });

  const sessionOptions = [
    { label: 'None', value: 'none' },
    { label: 'Table', value: 'table' },
    { label: 'HTTP Cookie', value: 'http_cookie' },
  ];

  const defaultSession = sessionOptions.find((eachSession) => {
    return eachSession.value === sessionStickiness;
  });

  const tcpSelected = protocol === 'tcp';

  return (
    <Grid data-qa-label-header xs={12}>
      {globalFormError && (
        <Notice
          className={`error-for-scroll-${configIdx}`}
          text={globalFormError}
          variant="error"
        />
      )}
      <Grid container spacing={2}>
        <Grid md={3} xs={6}>
          <TextField
            InputProps={{ id: `port-${configIdx}` }}
            data-qa-port
            disabled={disabled}
            errorGroup={forEdit ? `${configIdx}` : undefined}
            errorText={errorMap.port || errorMap.configs}
            label="Port"
            noMarginTop
            onChange={onPortChange}
            required
            type="number"
            value={port || ''}
          />
          <FormHelperText>Listen on this port</FormHelperText>
        </Grid>
        <Grid md={3} xs={6}>
          <Select
            textFieldProps={{
              dataAttrs: {
                'data-qa-protocol-select': true,
              },
            }}
            disabled={disabled}
            errorGroup={forEdit ? `${configIdx}` : undefined}
            errorText={errorMap.protocol}
            inputId={`protocol-${configIdx}`}
            isClearable={false}
            label="Protocol"
            noMarginTop
            onChange={onProtocolChange}
            options={protocolOptions}
            small
            value={defaultProtocol || protocolOptions[0]}
          />
        </Grid>

        {protocol === 'https' && (
          <Grid xs={12}>
            <Grid container spacing={2}>
              <Grid xs={12}>
                <TextField
                  data-qa-cert-field
                  disabled={disabled}
                  errorGroup={forEdit ? `${configIdx}` : undefined}
                  errorText={errorMap.ssl_cert}
                  label="SSL Certificate"
                  multiline
                  onChange={onSslCertificateChange}
                  required={protocol === 'https'}
                  rows={3}
                  value={sslCertificate || ''}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  data-qa-private-key-field
                  disabled={disabled}
                  errorGroup={forEdit ? `${configIdx}` : undefined}
                  errorText={errorMap.ssl_key}
                  label="Private Key"
                  multiline
                  onChange={onPrivateKeyChange}
                  required={protocol === 'https'}
                  rows={3}
                  value={privateKey || ''}
                />
              </Grid>
            </Grid>
          </Grid>
        )}

        {tcpSelected && (
          <Grid md={3} xs={6}>
            <Select
              textFieldProps={{
                dataAttrs: {
                  'data-qa-proxy-protocol-select': true,
                },
              }}
              disabled={disabled}
              errorGroup={forEdit ? `${configIdx}` : undefined}
              errorText={errorMap.proxy_protocol}
              inputId={`proxy-protocol-${configIdx}`}
              isClearable={false}
              label="Proxy Protocol"
              noMarginTop
              onChange={onProxyProtocolChange}
              options={proxyProtocolOptions}
              small
              value={selectedProxyProtocol || proxyProtocolOptions[0]}
            />
            <FormHelperText>
              Proxy Protocol preserves initial TCP connection information.
              Please consult{' '}
              <Link to="https://www.linode.com/docs/platform/nodebalancer/nodebalancer-proxypass-configuration/">
                our Proxy Protocol guide
              </Link>
              {` `}
              for information on the differences between each option.
            </FormHelperText>
          </Grid>
        )}

        <Grid md={tcpSelected ? 6 : 3} xs={6}>
          <Select
            textFieldProps={{
              dataAttrs: {
                'data-qa-algorithm-select': true,
              },
            }}
            disabled={disabled}
            errorGroup={forEdit ? `${configIdx}` : undefined}
            errorText={errorMap.algorithm}
            inputId={`algorithm-${configIdx}`}
            isClearable={false}
            label="Algorithm"
            noMarginTop
            onChange={onAlgorithmChange}
            options={algOptions}
            small
            value={defaultAlg || algOptions[0]}
          />
          <FormHelperText>
            Roundrobin. Least connections assigns connections to the backend
            with the least connections. Source uses the client&rsquo;s IPv4
            address
          </FormHelperText>
        </Grid>

        <Grid md={3} xs={6}>
          <Select
            textFieldProps={{
              dataAttrs: {
                'data-qa-session-stickiness-select': true,
              },
            }}
            disabled={disabled}
            errorGroup={forEdit ? `${configIdx}` : undefined}
            errorText={errorMap.stickiness}
            inputId={`session-stickiness-${configIdx}`}
            isClearable={false}
            label="Session Stickiness"
            noMarginTop
            onChange={onSessionStickinessChange}
            options={sessionOptions}
            small
            value={defaultSession || sessionOptions[1]}
          />
          <FormHelperText>
            Route subsequent requests from the client to the same backend
          </FormHelperText>
        </Grid>
        <Grid xs={12}>
          <Divider />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <ActiveCheck errorMap={errorMap} {...props} />
        <PassiveCheck {...props} />
        <Grid xs={12}>
          <Divider />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid xs={12}>
          {nodeMessage && (
            <Grid xs={12}>
              <Notice text={nodeMessage} variant="info" />
            </Grid>
          )}
          <Typography data-qa-backend-ip-header variant="h2">
            Backend Nodes
          </Typography>
          {errorMap.nodes && (
            <FormHelperText error>{errorMap.nodes}</FormHelperText>
          )}
        </Grid>
        <Grid
          sx={{
            paddingBottom: '24px',
          }}
          xs={12}
        >
          <Grid container spacing={2} sx={{ padding: 0 }}>
            {nodes?.map((node, nodeIdx) => (
              <NodeBalancerConfigNode
                configIdx={configIdx}
                disabled={Boolean(disabled)}
                forEdit={Boolean(forEdit)}
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
            <Grid
              // is the Save/Delete ActionsPanel showing?
              style={
                forEdit || configIdx !== 0
                  ? { marginBottom: -16, marginTop: 0 }
                  : { marginTop: 16 }
              }
              xs={12}
            >
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
        <Grid xs={12}>
          <Divider />
        </Grid>
        <Grid
          alignItems="center"
          container
          justifyContent="flex-end"
          spacing={2}
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
