import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Divider from 'src/components/core/Divider';
import FormHelperText from 'src/components/core/FormHelperText';
import Typography from 'src/components/core/Typography';
import type { Item } from 'src/components/EnhancedSelect/Select';
import Select from 'src/components/EnhancedSelect/Select';
import Link from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import TextField from 'src/components/TextField';
import { ActiveCheck } from './NodeBalancerActiveCheck';
import { NodeBalancerConfigNode } from './NodeBalancerConfigNode';
import { PassiveCheck } from './NodeBalancerPassiveCheck';
import type { NodeBalancerConfigPanelProps } from './types';
import { setErrorMap } from './utils';

const DATA_NODE = 'data-node-idx';

export const NodeBalancerConfigPanel = (
  props: NodeBalancerConfigPanelProps
) => {
  const {
    algorithm,
    configIdx,
    errors,
    forEdit,
    nodes,
    nodeMessage,
    port,
    privateKey,
    protocol,
    proxyProtocol,
    sessionStickiness,
    sslCertificate,
    submitting,
    disabled,
    onSave,
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
    const nodeIdx: string | null = e.currentTarget.getAttribute(DATA_NODE);
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
    <Grid xs={12} data-qa-label-header>
      {globalFormError && (
        <Notice
          className={`error-for-scroll-${configIdx}`}
          text={globalFormError}
          error
        />
      )}
      <Grid container spacing={2}>
        <Grid xs={6} md={3}>
          <TextField
            type="number"
            label="Port"
            required
            value={port || ''}
            onChange={onPortChange}
            errorText={errorMap.port || errorMap.configs}
            errorGroup={forEdit ? `${configIdx}` : undefined}
            data-qa-port
            disabled={disabled}
            noMarginTop
            InputProps={{ id: `port-${configIdx}` }}
          />
          <FormHelperText>Listen on this port</FormHelperText>
        </Grid>
        <Grid xs={6} md={3}>
          <Select
            options={protocolOptions}
            label="Protocol"
            inputId={`protocol-${configIdx}`}
            value={defaultProtocol || protocolOptions[0]}
            onChange={onProtocolChange}
            errorText={errorMap.protocol}
            errorGroup={forEdit ? `${configIdx}` : undefined}
            textFieldProps={{
              dataAttrs: {
                'data-qa-protocol-select': true,
              },
            }}
            disabled={disabled}
            noMarginTop
            small
            isClearable={false}
          />
        </Grid>

        {protocol === 'https' && (
          <Grid xs={12}>
            <Grid container spacing={2}>
              <Grid xs={12}>
                <TextField
                  multiline
                  rows={3}
                  label="SSL Certificate"
                  value={sslCertificate || ''}
                  onChange={onSslCertificateChange}
                  required={protocol === 'https'}
                  errorText={errorMap.ssl_cert}
                  errorGroup={forEdit ? `${configIdx}` : undefined}
                  data-qa-cert-field
                  disabled={disabled}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  multiline
                  rows={3}
                  label="Private Key"
                  value={privateKey || ''}
                  onChange={onPrivateKeyChange}
                  required={protocol === 'https'}
                  errorText={errorMap.ssl_key}
                  errorGroup={forEdit ? `${configIdx}` : undefined}
                  data-qa-private-key-field
                  disabled={disabled}
                />
              </Grid>
            </Grid>
          </Grid>
        )}

        {tcpSelected && (
          <Grid xs={6} md={3}>
            <Select
              options={proxyProtocolOptions}
              label="Proxy Protocol"
              inputId={`proxy-protocol-${configIdx}`}
              value={selectedProxyProtocol || proxyProtocolOptions[0]}
              onChange={onProxyProtocolChange}
              errorText={errorMap.proxy_protocol}
              errorGroup={forEdit ? `${configIdx}` : undefined}
              textFieldProps={{
                dataAttrs: {
                  'data-qa-proxy-protocol-select': true,
                },
              }}
              disabled={disabled}
              noMarginTop
              small
              isClearable={false}
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

        <Grid xs={6} md={tcpSelected ? 6 : 3}>
          <Select
            options={algOptions}
            label="Algorithm"
            inputId={`algorithm-${configIdx}`}
            value={defaultAlg || algOptions[0]}
            onChange={onAlgorithmChange}
            errorText={errorMap.algorithm}
            errorGroup={forEdit ? `${configIdx}` : undefined}
            textFieldProps={{
              dataAttrs: {
                'data-qa-algorithm-select': true,
              },
            }}
            small
            disabled={disabled}
            isClearable={false}
            noMarginTop
          />
          <FormHelperText>
            Roundrobin. Least connections assigns connections to the backend
            with the least connections. Source uses the client&rsquo;s IPv4
            address
          </FormHelperText>
        </Grid>

        <Grid xs={6} md={3}>
          <Select
            options={sessionOptions}
            label="Session Stickiness"
            inputId={`session-stickiness-${configIdx}`}
            value={defaultSession || sessionOptions[1]}
            onChange={onSessionStickinessChange}
            errorText={errorMap.stickiness}
            errorGroup={forEdit ? `${configIdx}` : undefined}
            textFieldProps={{
              dataAttrs: {
                'data-qa-session-stickiness-select': true,
              },
            }}
            small
            disabled={disabled}
            isClearable={false}
            noMarginTop
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
              <Notice text={nodeMessage} success />
            </Grid>
          )}
          <Typography variant="h2" data-qa-backend-ip-header>
            Backend Nodes
          </Typography>
          {errorMap.nodes && (
            <FormHelperText error>{errorMap.nodes}</FormHelperText>
          )}
        </Grid>
        <Grid
          xs={12}
          sx={{
            paddingBottom: '24px',
          }}
        >
          <Grid container spacing={2} sx={{ padding: 0 }}>
            {nodes?.map((node, nodeIdx) => (
              <NodeBalancerConfigNode
                key={`nb-node-${nodeIdx}`}
                forEdit={Boolean(forEdit)}
                node={node}
                idx={nodeIdx}
                configIdx={configIdx}
                nodeBalancerRegion={props.nodeBalancerRegion}
                onNodeLabelChange={onNodeLabelChange}
                onNodeAddressChange={props.onNodeAddressChange}
                onNodeModeChange={onNodeModeChange}
                onNodeWeightChange={onNodeWeightChange}
                onNodePortChange={onNodePortChange}
                disabled={Boolean(disabled)}
                removeNode={removeNode}
              />
            ))}
            <Grid
              xs={12}
              // is the Save/Delete ActionsPanel showing?
              style={
                forEdit || configIdx !== 0
                  ? { marginTop: 0, marginBottom: -16 }
                  : { marginTop: 16 }
              }
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

      {(forEdit || configIdx !== 0) && (
        <React.Fragment>
          <Grid xs={12}>
            <Divider />
          </Grid>
          <Grid
            container
            justifyContent="flex-end"
            alignItems="center"
            spacing={2}
          >
            <StyledActionsPanel>
              {(forEdit || configIdx !== 0) && (
                <Button
                  buttonType="secondary"
                  onClick={props.onDelete}
                  disabled={disabled}
                  data-qa-delete-config
                >
                  Delete
                </Button>
              )}
              {forEdit && (
                <Button
                  buttonType="primary"
                  onClick={onSave}
                  disabled={disabled}
                  loading={submitting}
                  data-qa-save-config
                >
                  Save
                </Button>
              )}
            </StyledActionsPanel>
          </Grid>
        </React.Fragment>
      )}
    </Grid>
  );
};

const StyledActionsPanel = styled(ActionsPanel, {
  label: 'StyledActionsPanel',
})(({ theme }) => ({
  paddingBottom: 0,
  paddingRight: `${theme.spacing()} !important`,
}));
