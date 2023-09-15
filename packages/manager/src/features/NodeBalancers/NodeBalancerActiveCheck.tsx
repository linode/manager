import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import Select from 'src/components/EnhancedSelect/Select';
import { FormHelperText } from 'src/components/FormHelperText';
import { InputAdornment } from 'src/components/InputAdornment';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';

import { setErrorMap } from './utils';

import type { NodeBalancerConfigPanelProps } from './types';
import type { Item } from 'src/components/EnhancedSelect';

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
    <Grid md={6} xs={12}>
      <Grid container spacing={2} sx={{ padding: 1 }}>
        <Grid xs={12}>
          <Typography data-qa-active-checks-header variant="h2">
            Active Health Checks
          </Typography>
        </Grid>
        <Grid xs={12}>
          <Select
            textFieldProps={{
              dataAttrs: {
                'data-qa-active-check-select': true,
              },
            }}
            disabled={disabled}
            errorGroup={forEdit ? `${configIdx}` : undefined}
            errorText={errorMap.check}
            inputId={`type-${configIdx}`}
            isClearable={false}
            label="Type"
            noMarginTop
            onChange={onHealthCheckTypeChange}
            options={typeOptions}
            small
            value={defaultType || typeOptions[0]}
          />
          <FormHelperText>
            Active health checks proactively check the health of back-end nodes.{' '}
            {conditionalText}
          </FormHelperText>
        </Grid>
        {healthCheckType !== 'none' && (
          <Grid container>
            <Grid xs={12}>
              <TextField
                InputProps={{
                  'aria-label': 'Active Health Check Interval',
                  endAdornment: (
                    <InputAdornment position="end">seconds</InputAdornment>
                  ),
                }}
                data-qa-active-check-interval
                disabled={disabled}
                errorGroup={forEdit ? `${configIdx}` : undefined}
                errorText={errorMap.check_interval}
                label="Interval"
                onChange={onHealthCheckIntervalChange}
                type="number"
                value={healthCheckInterval}
              />
              <FormHelperText>
                Seconds between health check probes
              </FormHelperText>
            </Grid>
            <Grid xs={12}>
              <TextField
                InputProps={{
                  'aria-label': 'Active Health Check Timeout',
                  endAdornment: (
                    <InputAdornment position="end">seconds</InputAdornment>
                  ),
                }}
                data-qa-active-check-timeout
                disabled={disabled}
                errorGroup={forEdit ? `${configIdx}` : undefined}
                errorText={errorMap.check_timeout}
                label="Timeout"
                onChange={onHealthCheckTimeoutChange}
                type="number"
                value={healthCheckTimeout}
              />
              <FormHelperText>
                Seconds to wait before considering the probe a failure. 1-30.
                Must be less than check_interval.
              </FormHelperText>
            </Grid>
            <Grid lg={6} xs={12}>
              <TextField
                InputProps={{
                  'aria-label': 'Active Health Check Attempts',
                }}
                data-qa-active-check-attempts
                disabled={disabled}
                errorGroup={forEdit ? `${configIdx}` : undefined}
                errorText={errorMap.check_attempts}
                label="Attempts"
                onChange={onHealthCheckAttemptsChange}
                type="number"
                value={healthCheckAttempts}
              />
              <FormHelperText>
                Number of failed probes before taking a node out of rotation.
                1-30
              </FormHelperText>
            </Grid>
            {['http', 'http_body'].includes(healthCheckType) && (
              <Grid lg={6} xs={12}>
                <TextField
                  disabled={disabled}
                  errorGroup={forEdit ? `${configIdx}` : undefined}
                  errorText={errorMap.check_path}
                  label="Check HTTP Path"
                  onChange={onCheckPathChange}
                  required={['http', 'http_body'].includes(healthCheckType)}
                  value={checkPath || ''}
                />
              </Grid>
            )}
            {healthCheckType === 'http_body' && (
              <Grid md={12} xs={12}>
                <TextField
                  disabled={disabled}
                  errorGroup={forEdit ? `${configIdx}` : undefined}
                  errorText={errorMap.check_body}
                  label="Expected HTTP Body"
                  onChange={onCheckBodyChange}
                  required={healthCheckType === 'http_body'}
                  value={checkBody}
                />
              </Grid>
            )}
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};
