import * as React from 'react';
import FormHelperText from 'src/components/core/FormHelperText';
import Grid from '@mui/material/Unstable_Grid2';
import InputAdornment from 'src/components/core/InputAdornment';
import Select from 'src/components/EnhancedSelect/Select';
import TextField from 'src/components/TextField';
import Typography from 'src/components/core/Typography';
import { setErrorMap } from './utils';
import type { Item } from 'src/components/EnhancedSelect';
import type { NodeBalancerConfigPanelProps } from './types';

interface ActiveCheckProps extends NodeBalancerConfigPanelProps {
  errorMap: Record<string, string | undefined>;
}

const displayProtocolText = (p: string) => {
  if (p === 'tcp') {
    return `'TCP Connection' requires a successful TCP handshake.`;
  }
  if (p === 'http' || p === 'https') {
    return `'HTTP Valid Status' requires a 2xx or 3xx response from the backend node. 'HTTP Body Regex' uses a regex to match against an expected result body.`;
  }
  return undefined;
};

export const ActiveCheck = (props: ActiveCheckProps) => {
  const {
    checkBody,
    checkPath,
    configIdx,
    disabled,
    errors,
    forEdit,
    healthCheckAttempts,
    healthCheckInterval,
    healthCheckTimeout,
    healthCheckType,
    protocol,
  } = props;

  const errorMap = setErrorMap(errors || []);

  const onCheckBodyChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    props.onCheckBodyChange(e.target.value);

  const onCheckPathChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    props.onCheckPathChange(e.target.value);

  const onHealthCheckAttemptsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => props.onHealthCheckAttemptsChange(e.target.value);

  const onHealthCheckIntervalChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => props.onHealthCheckIntervalChange(e.target.value);

  const onHealthCheckTimeoutChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    props.onHealthCheckTimeoutChange(e.target.value);

  const onHealthCheckTypeChange = (e: Item<string>) =>
    props.onHealthCheckTypeChange(e.value);

  const conditionalText = displayProtocolText(protocol);

  const typeOptions = [
    {
      label: 'None',
      value: 'none',
    },
    {
      label: 'TCP Connection',
      value: 'connection',
    },
    {
      disabled: protocol === 'tcp',
      label: 'HTTP Status',
      value: 'http',
    },
    {
      disabled: protocol === 'tcp',
      label: 'HTTP Body',
      value: 'http_body',
    },
  ];

  const defaultType = typeOptions.find((eachType) => {
    return eachType.value === healthCheckType;
  });

  return (
    <Grid xs={12} md={6} sx={{ padding: 0 }}>
      <Grid container spacing={2}>
        <Grid xs={12}>
          <Typography variant="h2" data-qa-active-checks-header>
            Active Health Checks
          </Typography>
        </Grid>
        <Grid xs={12}>
          <Select
            options={typeOptions}
            label="Type"
            inputId={`type-${configIdx}`}
            value={defaultType || typeOptions[0]}
            onChange={onHealthCheckTypeChange}
            errorText={errorMap.check}
            errorGroup={forEdit ? `${configIdx}` : undefined}
            textFieldProps={{
              dataAttrs: {
                'data-qa-active-check-select': true,
              },
            }}
            small
            disabled={disabled}
            isClearable={false}
            noMarginTop
          />
          <FormHelperText>
            Active health checks proactively check the health of back-end nodes.{' '}
            {conditionalText}
          </FormHelperText>
        </Grid>
        {healthCheckType !== 'none' && (
          <React.Fragment>
            <Grid xs={12}>
              <TextField
                type="number"
                label="Interval"
                InputProps={{
                  'aria-label': 'Active Health Check Interval',
                  endAdornment: (
                    <InputAdornment position="end">seconds</InputAdornment>
                  ),
                }}
                value={healthCheckInterval}
                onChange={onHealthCheckIntervalChange}
                errorText={errorMap.check_interval}
                errorGroup={forEdit ? `${configIdx}` : undefined}
                data-qa-active-check-interval
                disabled={disabled}
              />
              <FormHelperText>
                Seconds between health check probes
              </FormHelperText>
            </Grid>
            <Grid xs={12}>
              <TextField
                type="number"
                label="Timeout"
                InputProps={{
                  'aria-label': 'Active Health Check Timeout',
                  endAdornment: (
                    <InputAdornment position="end">seconds</InputAdornment>
                  ),
                }}
                value={healthCheckTimeout}
                onChange={onHealthCheckTimeoutChange}
                errorText={errorMap.check_timeout}
                errorGroup={forEdit ? `${configIdx}` : undefined}
                data-qa-active-check-timeout
                disabled={disabled}
              />
              <FormHelperText>
                Seconds to wait before considering the probe a failure. 1-30.
                Must be less than check_interval.
              </FormHelperText>
            </Grid>
            <Grid xs={12} lg={6}>
              <TextField
                type="number"
                label="Attempts"
                value={healthCheckAttempts}
                onChange={onHealthCheckAttemptsChange}
                errorText={errorMap.check_attempts}
                errorGroup={forEdit ? `${configIdx}` : undefined}
                InputProps={{
                  'aria-label': 'Active Health Check Attempts',
                }}
                data-qa-active-check-attempts
                disabled={disabled}
              />
              <FormHelperText>
                Number of failed probes before taking a node out of rotation.
                1-30
              </FormHelperText>
            </Grid>
            {['http', 'http_body'].includes(healthCheckType) && (
              <Grid xs={12} lg={6}>
                <TextField
                  label="Check HTTP Path"
                  value={checkPath || ''}
                  onChange={onCheckPathChange}
                  required={['http', 'http_body'].includes(healthCheckType)}
                  errorText={errorMap.check_path}
                  errorGroup={forEdit ? `${configIdx}` : undefined}
                  disabled={disabled}
                />
              </Grid>
            )}
            {healthCheckType === 'http_body' && (
              <Grid xs={12} md={4}>
                <TextField
                  label="Expected HTTP Body"
                  value={checkBody}
                  onChange={onCheckBodyChange}
                  required={healthCheckType === 'http_body'}
                  errorText={errorMap.check_body}
                  errorGroup={forEdit ? `${configIdx}` : undefined}
                  disabled={disabled}
                />
              </Grid>
            )}
          </React.Fragment>
        )}
      </Grid>
    </Grid>
  );
};
