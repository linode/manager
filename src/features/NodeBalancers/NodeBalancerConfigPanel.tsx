import Downshift, { DownshiftState, StateChangeOptions } from 'downshift';
import * as React from 'react';

import Divider from '@material-ui/core/Divider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputAdornment from '@material-ui/core/InputAdornment';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import Toggle from 'src/components/Toggle';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 'root'
  | 'inner'
  | 'divider'
  | 'backendIPAction'
  | 'suggestionsParent'
  | 'suggestions'
  | 'suggestionItem'
  | 'selectedSuggestionItem';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
  },
  inner: {},
  divider: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
  backendIPAction: {
    paddingLeft: theme.spacing.unit * 2,
    marginLeft: -theme.spacing.unit,
    marginTop: theme.spacing.unit * 2,
    [theme.breakpoints.down('xs')]: {
      marginLeft: -32,
    },
  },
  suggestionsParent: {
    position: 'relative',
  },
  suggestions: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 80,
    padding: 0,
    boxShadow: `0 0 10px ${theme.color.boxShadow}`,
    maxHeight: 150,
    overflowY: 'auto',
    width: '100%',
    maxWidth: 415,
    zIndex: 2,
  },
  suggestionItem: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    '&:hover, &:focus': {
      backgroundColor: `${theme.palette.primary.main} !important`,
      color: `white !important`,
    },
    '&:last-item': {
      border: 0,
    },
  },
  selectedSuggestionItem: {
    backgroundColor: `${theme.palette.primary.main} !important`,
    color: '#fff !important',
  },
});

const styled = withStyles(styles, { withTheme: true });

interface Props {
  linodesWithPrivateIPs?: Linode.Linode[] | null;
  errors?: Linode.ApiFieldError[];
  nodeMessage?: string;
  configIdx?: number;

  forEdit?: boolean;
  submitting?: boolean;
  onSave?: () => void;
  onDelete?: () => void;

  algorithm: 'roundrobin' | 'leastconn' | 'source';
  onAlgorithmChange: (v: string) => void;

  checkPassive: boolean;
  onCheckPassiveChange: (v: boolean) => void;

  checkBody: string;
  onCheckBodyChange: (v: string) => void;

  checkPath: string;
  onCheckPathChange: (v: string) => void;

  port: number;
  onPortChange: (v: string | number) => void;

  protocol: 'http' | 'https' | 'tcp';
  onProtocolChange: (v: string) => void;

  healthCheckType: 'none' | 'connection' | 'http' | 'http_body';
  onHealthCheckTypeChange: (v: string) => void;

  healthCheckAttempts: number;
  onHealthCheckAttemptsChange: (v: string | number) => void;

  healthCheckInterval: number;
  onHealthCheckIntervalChange: (v: string | number) => void;

  healthCheckTimeout: number;
  onHealthCheckTimeoutChange: (v: string | number) => void;

  sessionStickiness: 'none' | 'table' | 'http_cookie';
  onSessionStickinessChange: (v: string) => void;

  sslCertificate: string;
  onSslCertificateChange: (v: string) => void;

  privateKey: string;
  onPrivateKeyChange: (v: string) => void;

  nodes: Linode.NodeBalancerConfigNode[];
  addNode: (nodeIdx?: number) => void;
  removeNode: (nodeIdx: number) => void;
  onNodeLabelChange: (nodeIdx: number, value: string) => void;
  onNodeAddressChange: (nodeIdx: number, value: string) => void;
  onNodePortChange: (nodeIdx: number, value: string) => void;
  onNodeWeightChange: (nodeIdx: number, value: string) => void;
  onNodeModeChange?: (nodeIdx: number, value: string) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

interface State {
  currentNodeAddressIndex: number | null;
}

class NodeBalancerConfigPanel extends React.Component<CombinedProps> {


  state: State = {
    currentNodeAddressIndex: null,
  }

  static defaultProps: Partial<Props> = {
  };

  onAlgorithmChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onAlgorithmChange(e.target.value)

  onCheckPassiveChange = (e: React.ChangeEvent<HTMLInputElement>, value: boolean) =>
    this.props.onCheckPassiveChange(value)

  onCheckBodyChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onCheckBodyChange(e.target.value)

  onCheckPathChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onCheckPathChange(e.target.value)

  onHealthCheckAttemptsChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onHealthCheckAttemptsChange(e.target.value)

  onHealthCheckIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onHealthCheckIntervalChange(e.target.value)

  onHealthCheckTimeoutChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onHealthCheckTimeoutChange(e.target.value)

  onHealthCheckTypeChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onHealthCheckTypeChange(e.target.value)

  onPortChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onPortChange(e.target.value)

  onPrivateKeyChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onPrivateKeyChange(e.target.value)

  onProtocolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { healthCheckType } = this.props;
    const { target: { value: protocol } } = e;

    this.props.onProtocolChange(e.target.value);

    if (protocol === 'tcp' && (healthCheckType === 'http' || healthCheckType === 'http_body')) {
      this.props.onHealthCheckTypeChange('connection');
    }
    if (protocol === 'http' && healthCheckType === 'connection') {
      this.props.onHealthCheckTypeChange('http');
    }
    if (protocol === 'https' && healthCheckType === 'connection') {
      this.props.onHealthCheckTypeChange('http');
    }
  }

  onSessionStickinessChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onSessionStickinessChange(e.target.value)

  onSslCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.props.onSslCertificateChange(e.target.value)

  onNodeLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nodeIdx = e.currentTarget.getAttribute('data-node-idx');
    if (nodeIdx) {
      this.props.onNodeLabelChange(
        +nodeIdx,
        e.target.value,
      );
    }
  }

  onNodeAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nodeIdx = e.currentTarget.getAttribute('data-node-idx');
    if (nodeIdx) {
      this.props.onNodeAddressChange(
        +nodeIdx,
        e.target.value,
      );
    }
  }

  onNodePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nodeIdx = e.currentTarget.getAttribute('data-node-idx');
    if (nodeIdx) {
      this.props.onNodePortChange(
        +nodeIdx,
        e.target.value,
      );
    }
  }

  onNodeWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nodeIdx = e.currentTarget.getAttribute('data-node-idx');
    if (nodeIdx) {
      this.props.onNodeWeightChange(
        +nodeIdx,
        e.target.value,
      );
    }
  }

  onNodeModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nodeIdx = e.currentTarget.getAttribute('data-node-idx');
    if (nodeIdx) {
      this.props.onNodeModeChange!(
        +nodeIdx,
        e.target.value,
      );
    }
  }

  addNode = (e: React.MouseEvent<HTMLElement>) => {
    this.props.addNode();
  }

  removeNode = (e: React.MouseEvent<HTMLElement>) => {
    const nodeIdx: string | null = e.currentTarget.getAttribute('data-node-idx');
    const { removeNode } = this.props;
    if (removeNode && nodeIdx) {
      return removeNode(+nodeIdx);
    }
  }

  onSave = this.props.onSave;

  onDelete = this.props.onDelete;

  handleSelectSuggestion = (selection: string) => {
    const { currentNodeAddressIndex } = this.state;
    if (currentNodeAddressIndex) {
      this.props.onNodeAddressChange(
        +currentNodeAddressIndex,
        selection,
      );
    }
  }

  handleFocusAddressField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nodeIdx = e.currentTarget.getAttribute('data-node-idx');
    // this is necesssary because when we select a suggested
    // ip address, it needs to know what index we're looking at.
    this.setState({ currentNodeAddressIndex: nodeIdx });
  }

  renderSearchSuggestion = (
    linode: Linode.Linode,
    index: number,
    highlightedIndex: number | null,
    itemProps: any,
  ) => {
    const isHighlighted = highlightedIndex === index;
    const { classes } = this.props;

    const privateIPRegex = /^10\.|^172\.1[6-9]\.|^172\.2[0-9]\.|^172\.3[0-1]\.|^192\.168\.|^fd/;
    const privateIP = linode.ipv4.find(ipv4 => !!ipv4.match(privateIPRegex));
    return (
      <MenuItem
        // when the suggested is selected, put the private IP in the field
        {...itemProps({ item: privateIP })}
        key={index}
        component="div"
        selected={isHighlighted}
        className={classes.suggestionItem}
        classes={{ selected: classes.selectedSuggestionItem }}
      >
        {
          <React.Fragment>
            <strong>{privateIP}</strong>&nbsp;{linode.label}
          </React.Fragment>
        }
      </MenuItem>
    )
  }

  downshiftStateReducer = (state: DownshiftState, changes: StateChangeOptions) => {
    switch (changes.type) {
      // basically, don't clear the field value when we leave the field
      case Downshift.stateChangeTypes.blurInput:
      case Downshift.stateChangeTypes.mouseUp:
        return {
          ...changes,
          inputValue: state.inputValue || '',
          isOpen: false,
        }
        default:
          return changes;
    }
  }

  render() {
    const {
      algorithm,
      checkBody,
      checkPassive,
      checkPath,
      classes,
      configIdx,
      errors,
      forEdit,
      healthCheckAttempts,
      healthCheckInterval,
      healthCheckTimeout,
      healthCheckType,
      nodes,
      nodeMessage,
      port,
      privateKey,
      protocol,
      sessionStickiness,
      sslCertificate,
      submitting,
    } = this.props;

    const hasErrorFor = getAPIErrorFor({
      algorithm: 'Algorithm',
      check_attempts: 'Check attempts',
      check_body: 'Check body',
      check_interval: 'Check interval',
      check_passive: 'Passive check',
      check_path: 'Check path',
      check_timeout: 'Check timeout',
      check: 'Check type',
      cipher_suite: 'Cipher suite',
      port: 'Port',
      protocol: 'Protocol',
      ssl_cert: 'SSL certificate',
      ssl_key: 'SSL private key',
      stickiness: 'Session stickiness',
      nodes: 'Nodes',
    }, errors);

    return (
      <Grid item xs={12}>
        <Paper className={classes.root} data-qa-label-header>
          <div className={classes.inner}>
            <Grid
              updateFor={[
                port,
                protocol,
                hasErrorFor('port'),
                hasErrorFor('protocol'),
                configIdx,
              ]}
              container
            >
              <Grid item xs={12}>
                <Typography
                  role="header"
                  variant="title"
                  data-qa-port-config-header
                >
                  Port Configuration
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  type="number"
                  label="Port"
                  required
                  value={port || ''}
                  onChange={this.onPortChange}
                  errorText={hasErrorFor('port')}
                  errorGroup={forEdit ? `${configIdx}`: undefined}
                  data-qa-port
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Protocol"
                  value={protocol}
                  select
                  onChange={this.onProtocolChange}
                  errorText={hasErrorFor('protocol')}
                  errorGroup={forEdit ? `${configIdx}`: undefined}
                  data-qa-protocol-select
                >
                  <MenuItem
                    value="tcp"
                    data-qa-option="tcp"
                  >
                    TCP
                  </MenuItem>
                  <MenuItem
                    value="http"
                    data-qa-option="http"
                  >
                    HTTP
                  </MenuItem>
                  <MenuItem
                    value="https"
                    data-qa-option="https"
                  >
                    HTTPS
                  </MenuItem>
                </TextField>
              </Grid>
            </Grid>

            {
              protocol === 'https' &&
              <Grid
                updateFor={[
                  sslCertificate,
                  protocol,
                  hasErrorFor('ssl_cert'),
                  privateKey,
                  hasErrorFor('ssl_key'),
                  configIdx,
                ]}
                container
              >
                <Grid item xs={12} md={6}>
                  <TextField
                    multiline
                    rows={3}
                    label="SSL Certificate"
                    value={sslCertificate}
                    onChange={this.onSslCertificateChange}
                    required={protocol === 'https'}
                    errorText={hasErrorFor('ssl_cert')}
                    errorGroup={forEdit ? `${configIdx}`: undefined}
                    data-qa-cert-field
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    multiline
                    rows={3}
                    label="Private Key"
                    value={privateKey}
                    onChange={this.onPrivateKeyChange}
                    required={protocol === 'https'}
                    errorText={hasErrorFor('ssl_key')}
                    errorGroup={forEdit ? `${configIdx}`: undefined}
                    data-qa-private-key-field
                  />
                </Grid>
              </Grid>
            }

            <Grid
              updateFor={[
                algorithm,
                hasErrorFor('algorithm'),
                configIdx,
              ]}
              container
            >
              <Grid item xs={12} md={4}>
                <TextField
                  label="Algorithm"
                  value={algorithm}
                  select
                  onChange={this.onAlgorithmChange}
                  errorText={hasErrorFor('algorithm')}
                  errorGroup={forEdit ? `${configIdx}`: undefined}
                  data-qa-algorithm-select
                >
                  <MenuItem value="roundrobin" data-qa-option="roundrobin">
                    Round Robin
                  </MenuItem>
                  <MenuItem value="leastconn" data-qa-option="leastconn">
                    Least Connections
                  </MenuItem>
                  <MenuItem value="source" data-qa-option="source">
                    Source
                  </MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Grid
              updateFor={[
                sessionStickiness,
                hasErrorFor('stickiness'),
                configIdx,
              ]}
              container
            >
              <Grid item xs={12} md={4}>
                <TextField
                  label="Session Stickiness"
                  value={sessionStickiness}
                  select
                  onChange={this.onSessionStickinessChange}
                  errorText={hasErrorFor('stickiness')}
                  errorGroup={forEdit ? `${configIdx}`: undefined}
                  data-qa-session-stickiness-select
                >
                  <MenuItem
                    value="none"
                    data-qa-option="none"
                  >
                    None
                  </MenuItem>
                  <MenuItem
                    value="table"
                    data-qa-option="table"
                  >
                    Table
                  </MenuItem>
                  <MenuItem
                    value="http_cookie"
                    data-qa-option="http_cookie"
                  >
                    HTTP Cookie
                  </MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Divider className={classes.divider} />
              </Grid>
            </Grid>

            <Grid container>
              <Grid
                updateFor={[]} // never update after initial render
                item
                xs={12}
              >
                <Typography
                  role="header"
                  variant="title"
                  data-qa-active-checks-header
                >
                  Active Health Checks
                </Typography>
              </Grid>
              <Grid
                updateFor={[
                  protocol,
                  healthCheckType,
                  hasErrorFor('check'),
                  configIdx,
                ]}
                item
                xs={12}
              >
                <Grid item xs={12} lg={4}>
                  <TextField
                    label="Type"
                    value={healthCheckType}
                    select
                    onChange={this.onHealthCheckTypeChange}
                    errorText={hasErrorFor('check')}
                    errorGroup={forEdit ? `${configIdx}`: undefined}
                    data-qa-active-check-select
                  >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem
                      value="connection"
                      disabled={protocol === 'http' || protocol === 'https'}
                    >
                      TCP Connection
                    </MenuItem>

                    <MenuItem
                      value="http"
                      disabled={protocol === 'tcp'}
                    >
                      HTTP Status
                      </MenuItem>

                    <MenuItem
                      value="http_body"
                      disabled={protocol === 'tcp'}
                    >
                      HTTP Body
                    </MenuItem>
                  </TextField>
                </Grid>
              </Grid>
              {
                healthCheckType !== 'none' &&
                <React.Fragment>
                  <Grid
                    updateFor={[
                      healthCheckInterval,
                      hasErrorFor('check_interval'),
                      configIdx,
                    ]}
                    item
                    xs={12}
                    lg={4}
                  >
                    <TextField
                      type="number"
                      label="Interval"
                      InputProps={{
                        'aria-label': 'Active Health Check Interval',
                        endAdornment:
                        <InputAdornment position="end">
                          seconds
                        </InputAdornment>,
                      }}
                      value={healthCheckInterval}
                      onChange={this.onHealthCheckIntervalChange}
                      errorText={hasErrorFor('check_interval')}
                      errorGroup={forEdit ? `${configIdx}`: undefined}
                      data-qa-active-check-interval
                    />
                  </Grid>
                  <Grid
                    updateFor={[
                      healthCheckTimeout,
                      hasErrorFor('check_timeout'),
                      configIdx,
                    ]}
                    item
                    xs={12}
                    lg={4}
                  >
                    <TextField
                      type="number"
                      label="Timeout"
                      InputProps={{
                        'aria-label': 'Active Health Check Timeout',
                        endAdornment: 
                        <InputAdornment position="end">
                          seconds
                        </InputAdornment>,
                      }}
                      value={healthCheckTimeout}
                      onChange={this.onHealthCheckTimeoutChange}
                      errorText={hasErrorFor('check_timeout')}
                      errorGroup={forEdit ? `${configIdx}`: undefined}
                      data-qa-active-check-timeout
                    />
                  </Grid>
                  <Grid
                    updateFor={[
                      healthCheckAttempts,
                      hasErrorFor('check_attempts'),
                      configIdx,
                    ]}
                    item
                    xs={12}
                    lg={3}
                  >
                    <TextField
                      type="number"
                      label="Attempts"
                      value={healthCheckAttempts}
                      onChange={this.onHealthCheckAttemptsChange}
                      errorText={hasErrorFor('check_attempts')}
                      errorGroup={forEdit ? `${configIdx}`: undefined}
                      InputProps={{
                        'aria-label': 'Active Health Check Attempts',
                      }}
                      data-qa-active-check-attempts
                    />
                  </Grid>
                  {
                    ['http', 'http_body'].includes(healthCheckType) &&
                    <Grid
                      updateFor={[
                        checkPath,
                        healthCheckType,
                        hasErrorFor('check_path'),
                        configIdx,
                      ]}
                      item
                      xs={12}
                      md={4}
                    >
                      <TextField
                        label="Check HTTP Path"
                        value={checkPath || ''}
                        onChange={this.onCheckPathChange}
                        required={['http', 'http_body'].includes(healthCheckType)}
                        errorText={hasErrorFor('check_path')}
                        errorGroup={forEdit ? `${configIdx}`: undefined}
                      />
                    </Grid>
                  }
                  {
                    healthCheckType === 'http_body' &&
                    <Grid
                      updateFor={[
                        checkBody,
                        healthCheckType,
                        hasErrorFor('check_body'),
                        configIdx,
                      ]}
                      item
                      xs={12}
                      md={4}
                    >
                      <TextField
                        label="Expected HTTP Body"
                        value={checkBody}
                        onChange={this.onCheckBodyChange}
                        required={healthCheckType === 'http_body'}
                        errorText={hasErrorFor('check_body')}
                        errorGroup={forEdit ? `${configIdx}`: undefined}
                      />
                    </Grid>
                  }
                </React.Fragment>
              }
              <Grid
                updateFor={[]} // never update after initial render
                item
                xs={12}
              >
                <Divider className={classes.divider} />
              </Grid>
            </Grid>

            <Grid
              updateFor={[checkPassive]}
              container
            >
              <Grid item xs={12}>
                <Typography
                  role="header"
                  variant="title"
                  data-qa-passive-checks-header
                >
                  Passive Checks
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Toggle
                      checked={checkPassive}
                      onChange={this.onCheckPassiveChange}
                      data-qa-passive-checks-toggle={checkPassive}
                    />
                  }
                  label="Passive Checks"
                />
              </Grid>
              <Grid item xs={12}>
                <Divider className={classes.divider} />
              </Grid>
            </Grid>

            <Grid
              updateFor={[
                nodes,
                errors,
                nodeMessage,
              ]}
              container
            >
              <Grid item xs={12}>
                <Grid
                  updateFor={[nodeMessage]}
                  style={{ marginBottom: 16 }}
                  item
                  xs={12}
                >
                  {nodeMessage &&
                    <Notice
                      text={nodeMessage}
                      success
                    />
                  }
                </Grid>
                <Typography
                  role="header"
                  variant="title"
                  data-qa-backend-ip-header
                >
                  Backend Nodes
                </Typography>
                {hasErrorFor('nodes') &&
                  <FormHelperText error>{hasErrorFor('nodes')}</FormHelperText>
                }
              </Grid>
              <Grid item xs={12} style={{ paddingBottom: 24 }}>
                {
                  nodes && nodes.map((node, idx) => {
                    if (node.modifyStatus === 'delete') {
                      /* This node has been marked for deletion, don't display it */
                      return null;
                    }

                    const nodesHasErrorFor = getAPIErrorFor({
                      label: 'label',
                      address: 'address',
                      weight: 'weight',
                      port: 'port',
                      mode: 'mode',
                    }, node.errors);

                    return (
                      <Grid
                        key={idx}
                        updateFor={[
                          nodes.length,
                          node,
                          errors,
                          configIdx,
                        ]}
                        container
                        data-qa-node
                      >
                        {idx !== 0 &&
                          <Grid item xs={12}>
                            <Divider style={{ marginTop: forEdit ? 8 : 24 }} />
                          </Grid>
                        }
                        <Grid item xs={12} sm={forEdit ? 4 : 3} xl={2} className="py0">
                          <TextField
                            label="Label"
                            value={node.label}
                            inputProps={{ 'data-node-idx': idx }}
                            onChange={this.onNodeLabelChange}
                            errorText={nodesHasErrorFor('label')}
                            errorGroup={forEdit ? `${configIdx}`: undefined}
                            data-qa-backend-ip-label
                          />
                        </Grid>
                        <Grid item xs={12} sm={forEdit ? 4 : 3} xl={2} className="py0">
                          <Downshift
                            onSelect={this.handleSelectSuggestion}
                            stateReducer={this.downshiftStateReducer}
                          >
                            {
                              ({
                                getInputProps,
                                getItemProps,
                                isOpen,
                                inputValue,
                                highlightedIndex,
                                openMenu
                              }) => {
                                return (
                                  <div className={classes.suggestionsParent}>
                                    <TextField
                                      {...getInputProps({
                                        onChange: this.onNodeAddressChange,
                                        placeholder: 'Enter IP Address',
                                        value: node.address,
                                        onFocus: e => {
                                          openMenu();
                                          this.handleFocusAddressField(e)
                                        },
                                      })}
                                      label="IP Address"
                                      inputProps={{ 'data-node-idx': idx }}
                                      errorText={nodesHasErrorFor('address')}
                                      errorGroup={`${configIdx}`}
                                      data-qa-backend-ip-address
                                    />
                                    {isOpen &&
                                      <Paper className={classes.suggestions}>
                                      {/*
                                      * Do not change from this.props.linodesWithPrivateIPS
                                      * For some reason, referencing the destructured element
                                      * was returning an empty array, while this.props
                                      * is returning what we want
                                      */}
                                      {this.props.linodesWithPrivateIPs
                                        && this.props.linodesWithPrivateIPs
                                        // filter out the linodes that don't match what we're typing
                                        // filter by private ip and label
                                          .filter((linode: Linode.Linode) => {
                                            /*
                                            * Show all results if we have nothing entered
                                            */
                                            if (!inputValue) {
                                              return true;
                                            }
                                            const privateIPRegex = /^10\.|^172\.1[6-9]\.|^172\.2[0-9]\.|^172\.3[0-1]\.|^192\.168\.|^fd/;
                                            const privateIP = linode.ipv4.find(ipv4 => !!ipv4.match(privateIPRegex));
                                            return linode.label.toLowerCase().includes(inputValue.toLowerCase())
                                              || privateIP!.includes(inputValue.toLowerCase())
                                          })
                                          // limit the results to 5. we don't want too
                                          // many in the suggestions
                                          .splice(0, 10)
                                          // finally map over the results and render the suggestion
                                          .map((linode, index) => {
                                            return this.renderSearchSuggestion(
                                              linode,
                                              index,
                                              highlightedIndex,
                                              getItemProps,
                                            )
                                          })
                                        }
                                      </Paper>
                                    }
                                  </div>
                                )
                              }
                            }
                          </Downshift>
                        </Grid>
                        <Grid item xs={12} sm={forEdit ? 4 : 2} xl={2} className="py0">
                          <TextField
                            type="number"
                            label="Port"
                            value={node.port}
                            inputProps={{ 'data-node-idx': idx }}
                            onChange={this.onNodePortChange}
                            errorText={nodesHasErrorFor('port')}
                            errorGroup={forEdit ? `${configIdx}`: undefined}
                            data-qa-backend-ip-port
                            style={{ minWidth: 'auto' }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={forEdit ? 4 : 2} xl={2} className="py0">
                          <TextField
                            type="number"
                            label="Weight"
                            value={node.weight}
                            inputProps={{ 'data-node-idx': idx }}
                            onChange={this.onNodeWeightChange}
                            errorText={nodesHasErrorFor('weight')}
                            errorGroup={forEdit ? `${configIdx}`: undefined}
                            data-qa-backend-ip-weight
                            style={{ minWidth: 'auto' }}
                          />
                        </Grid>
                        {forEdit &&
                          <Grid item xs={12} sm={4} xl={2} className="py0">
                            <TextField
                              label="Mode"
                              value={node.mode}
                              select
                              inputProps={{ 'data-node-idx': idx }}
                              onChange={this.onNodeModeChange}
                              errorText={nodesHasErrorFor('mode')}
                              data-qa-backend-ip-mode
                            >
                              <MenuItem
                                value="accept"
                                data-node-idx={idx}
                              >
                                Accept
                              </MenuItem>
                              <MenuItem
                                value="reject"
                                data-node-idx={idx}
                              >
                                Reject
                              </MenuItem>
                              <MenuItem
                                value="drain"
                                data-node-idx={idx}
                              >
                                Drain
                              </MenuItem>
                            </TextField>
                          </Grid>
                        }
                        <ActionsPanel className={classes.backendIPAction}>
                          {(forEdit || idx !== 0) &&
                            <Button
                              type="remove"
                              data-node-idx={idx}
                              onClick={this.removeNode}
                              data-qa-remove-node
                            />
                          }
                        </ActionsPanel>
                      </Grid>
                    );
                  })
                }
                <Grid
                  item
                  xs={12}
                  updateFor={[]}
                  // is the Save/Delete ActionsPanel showing?
                  style={(forEdit || configIdx !== 0) ?
                    { marginTop: 16, marginBottom: -24 } :
                    { marginTop: 16 }
                  }
                >
                  <AddNewLink
                    label="Add a Node"
                    onClick={this.addNode}
                    left
                  />
                </Grid>
              </Grid>
            </Grid>

            {(forEdit || configIdx !== 0) &&
              <React.Fragment>
                <Grid
                  updateFor={[]}
                  item xs={12}
                >
                  <Divider className={classes.divider} />
                </Grid>
                <Grid
                  updateFor={[
                    submitting,
                  ]}
                  container
                  justify="space-between"
                  alignItems="center"
                >
                  <Grid
                    item
                    style={
                      forEdit
                        ? {}
                        : { marginTop: 8 }
                    }
                  >
                    <ActionsPanel style={{ padding: 0 }}>
                      {forEdit &&
                        <Button
                          variant="raised"
                          type="primary"
                          onClick={this.onSave}
                          loading={submitting}
                          data-qa-save-config
                        >
                          Save
                        </Button>
                      }
                      {(forEdit || configIdx !== 0) &&
                        <Button
                          onClick={this.onDelete}
                          type="secondary"
                          destructive
                          data-qa-delete-config
                        >
                          Delete
                        </Button>
                      }
                    </ActionsPanel>
                  </Grid>
                </Grid>
              </React.Fragment>
          }
        </div>
        </Paper>
      </Grid>
    );
  }
}

export default styled<Props>(NodeBalancerConfigPanel);
