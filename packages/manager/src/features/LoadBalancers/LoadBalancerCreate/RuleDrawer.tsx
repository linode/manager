import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import { getIn, useFormik, useFormikContext } from 'formik';
import React, { useState } from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Divider } from 'src/components/Divider';
import { Drawer } from 'src/components/Drawer';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { InputAdornment } from 'src/components/InputAdornment';
import { LinkButton } from 'src/components/LinkButton';
import { Notice } from 'src/components/Notice/Notice';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';
import { Toggle } from 'src/components/Toggle/Toggle';
import { Typography } from 'src/components/Typography';

import { MatchTypeInfo } from '../LoadBalancerDetail/Routes/MatchTypeInfo';
import { ROUTE_COPY } from '../LoadBalancerDetail/Routes/constants';
import {
  TimeUnit,
  defaultServiceTarget,
  defaultTTL,
  defaultTTLUnit,
  getIsSessionStickinessEnabled,
  matchTypeOptions,
  matchValuePlaceholder,
  stickyOptions,
  timeUnitFactorMap,
  timeUnitOptions,
} from '../LoadBalancerDetail/Routes/utils';

import type { LoadBalancerCreateFormData } from './LoadBalancerCreate';
import type { RuleCreatePayload } from '@linode/api-v4';

interface Props {
  configurationIndex: number | undefined;
  onClose: () => void;
  open: boolean;
  routeIndex: number | undefined;
  ruleIndexToEdit: number | undefined;
}

const initialValues = {
  match_condition: {
    hostname: '',
    match_field: 'path_prefix' as const,
    match_value: '',
    session_stickiness_cookie: null,
    session_stickiness_ttl: null,
  },
  service_targets: [],
};

export const RuleDrawer = (props: Props) => {
  const {
    configurationIndex,
    onClose: _onClose,
    open,
    routeIndex,
    ruleIndexToEdit,
  } = props;

  const {
    values,
    setFieldValue,
  } = useFormikContext<LoadBalancerCreateFormData>();

  const configuration = values.configurations![configurationIndex ?? 0];

  const route = configuration.routes![routeIndex ?? 0];

  const isEditMode = ruleIndexToEdit !== undefined;

  const protocol = route?.protocol ?? 'tcp';

  const [ttlUnit, setTTLUnit] = useState<TimeUnit>(defaultTTLUnit);

  const formik = useFormik<RuleCreatePayload>({
    enableReinitialize: true,
    initialValues: isEditMode
      ? route?.rules[ruleIndexToEdit] ?? initialValues
      : initialValues,
    async onSubmit(rule) {
      if (isEditMode) {
        setFieldValue(
          `configurations[${configurationIndex}].routes[${routeIndex}].rules[${ruleIndexToEdit}]`,
          rule
        );
      } else {
        setFieldValue(
          `configurations[${configurationIndex}].routes[${routeIndex}].rules`,
          [...route.rules, rule]
        );
      }
      onClose();
    },
  });

  const onClose = () => {
    _onClose();
    formik.resetForm();
    setTTLUnit(defaultTTLUnit);
  };

  const onAddServiceTarget = () => {
    formik.setFieldValue('service_targets', [
      ...formik.values.service_targets,
      defaultServiceTarget,
    ]);
  };

  const onRemoveServiceTarget = (index: number) => {
    formik.values.service_targets.splice(index, 1);
    formik.setFieldValue('service_targets', formik.values.service_targets);
  };

  const onStickinessChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    if (checked) {
      formik.setFieldValue(
        'match_condition.session_stickiness_ttl',
        defaultTTL
      );
    } else {
      formik.setFieldValue('match_condition.session_stickiness_ttl', null);
      formik.setFieldValue('match_condition.session_stickiness_cookie', null);
    }
  };

  const isStickinessEnabled = getIsSessionStickinessEnabled(formik.values);

  const cookieType =
    formik.values.match_condition.session_stickiness_ttl === null
      ? stickyOptions[1]
      : stickyOptions[0];

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={`${isEditMode ? 'Edit' : 'Add'} Rule`}
      wide
    >
      <form onSubmit={formik.handleSubmit}>
        <Typography sx={{ marginBottom: 2 }}>
          {ROUTE_COPY.Rule.Description[protocol]}
        </Typography>
        <Stack spacing={2}>
          <Stack bgcolor={(theme) => theme.bg.app} p={2.5} spacing={1.5}>
            <Typography variant="h3">Match Rule</Typography>
            <Typography>
              {ROUTE_COPY.Rule.MatchRule[route?.protocol ?? 'tcp']}
            </Typography>
            {route?.protocol !== 'tcp' && (
              <>
                <TextField
                  errorText={
                    formik.touched.match_condition?.hostname
                      ? formik.errors.match_condition?.hostname
                      : undefined
                  }
                  label="Hostname"
                  labelTooltipText={ROUTE_COPY.Rule.Hostname}
                  name="match_condition.hostname"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  optional
                  placeholder="www.example.com"
                  value={formik.values.match_condition.hostname}
                />
                <Stack direction="row" spacing={2}>
                  <Autocomplete
                    errorText={
                      formik.touched.match_condition?.match_field
                        ? formik.errors.match_condition?.match_field
                        : undefined
                    }
                    onBlur={() =>
                      formik.setFieldTouched('match_condition.match_field')
                    }
                    onChange={(_, option) =>
                      formik.setFieldValue(
                        'match_condition.match_field',
                        option?.value ?? null
                      )
                    }
                    value={
                      matchTypeOptions.find(
                        (option) =>
                          option.value ===
                          formik.values.match_condition.match_field
                      ) ?? matchTypeOptions[0]
                    }
                    disableClearable
                    label="Match Type"
                    options={matchTypeOptions}
                    sx={{ minWidth: 200 }}
                    textFieldProps={{ labelTooltipText: <MatchTypeInfo /> }}
                  />
                  <TextField
                    errorText={
                      formik.touched.match_condition?.match_value
                        ? formik.errors.match_condition?.match_value
                        : undefined
                    }
                    labelTooltipText={
                      ROUTE_COPY.Rule.MatchValue[
                        formik.values.match_condition.match_field
                      ]
                    }
                    placeholder={
                      matchValuePlaceholder[
                        formik.values.match_condition.match_field
                      ]
                    }
                    containerProps={{ sx: { flexGrow: 1 } }}
                    label="Match Value"
                    name="match_condition.match_value"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.match_condition.match_value}
                  />
                </Stack>
                <Stack alignItems="center" direction="row" gap={2}>
                  <Typography sx={{ fontStyle: 'italic' }}>
                    Routes to
                  </Typography>
                  <Divider light sx={{ flexGrow: 1 }} />
                </Stack>
              </>
            )}
            {typeof formik.errors.service_targets === 'string' && (
              <Notice
                spacingBottom={12}
                spacingTop={16}
                text={formik.errors.service_targets}
                variant="error"
              />
            )}
            {formik.values.service_targets.map((serviceTargt, index) => (
              <Stack
                direction="row"
                key={`${serviceTargt.label}-${index}`}
                spacing={2}
              >
                <TextField
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                  errorText={
                    formik.touched.service_targets?.[index]?.percentage
                      ? getIn(
                          formik.errors,
                          `service_targets[${index}].percentage`
                        )
                      : undefined
                  }
                  hideLabel={index !== 0}
                  label="Percent"
                  max={100}
                  min={0}
                  name={`service_targets[${index}].percentage`}
                  noMarginTop
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="number"
                  value={formik.values.service_targets[index].percentage}
                />
                <Autocomplete
                  isOptionEqualToValue={(option, value) =>
                    option.label === value.label
                  }
                  onChange={(_, value) =>
                    formik.setFieldValue(
                      `service_targets[${index}]`,
                      {
                        ...value,
                        percentage:
                          formik.values.service_targets[index].percentage,
                      },
                      true
                    )
                  }
                  textFieldProps={{
                    hideLabel: index !== 0,
                  }}
                  value={configuration.service_targets.find(
                    (st) =>
                      st.label === formik.values.service_targets[index].label
                  )}
                  fullWidth
                  label="Service Target"
                  noMarginTop={index === 0}
                  options={configuration.service_targets}
                />
                <IconButton
                  sx={{
                    height: '32px',
                    marginTop: `${index === 0 ? 28 : 2}px !important`,
                    width: '32px',
                  }}
                  aria-label={`Remove Service Target ${index}`}
                  onClick={() => onRemoveServiceTarget(index)}
                >
                  <CloseIcon />
                </IconButton>
              </Stack>
            ))}
            <Box>
              <LinkButton onClick={onAddServiceTarget}>
                Add Service Target
              </LinkButton>
            </Box>
          </Stack>
          {route?.protocol !== 'tcp' && (
            <Stack spacing={1.5}>
              <Typography variant="h3">Session Stickiness</Typography>
              <Typography>{ROUTE_COPY.Rule.Stickiness.Description}</Typography>
              <FormControlLabel
                control={
                  <Toggle
                    checked={isStickinessEnabled}
                    onChange={onStickinessChange}
                    sx={{ marginLeft: -1.5 }}
                  />
                }
                label="Use Session Stickiness"
              />
              {isStickinessEnabled && (
                <>
                  <Autocomplete
                    onChange={(_, option) => {
                      formik.setFieldValue(
                        'match_condition.session_stickiness_ttl',
                        option?.label === 'Load Balancer Generated'
                          ? defaultTTL
                          : null
                      );
                      formik.setFieldValue(
                        'match_condition.session_stickiness_cookie',
                        option?.label === 'Load Balancer Generated' ? null : ''
                      );
                    }}
                    textFieldProps={{
                      labelTooltipText: ROUTE_COPY.Rule.Stickiness.CookieType,
                    }}
                    disableClearable
                    label="Cookie type"
                    options={stickyOptions}
                    value={cookieType}
                  />
                  <TextField
                    errorText={
                      formik.touched.match_condition?.session_stickiness_cookie
                        ? formik.errors.match_condition
                            ?.session_stickiness_cookie
                        : undefined
                    }
                    value={
                      formik.values.match_condition.session_stickiness_cookie ??
                      ''
                    }
                    label="Cookie Key"
                    labelTooltipText={ROUTE_COPY.Rule.Stickiness.Cookie}
                    name="match_condition.session_stickiness_cookie"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    placeholder="my-cookie-name"
                  />
                  {cookieType.label === 'Load Balancer Generated' && (
                    <Stack direction="row" spacing={1}>
                      <TextField
                        errorText={
                          formik.touched.match_condition?.session_stickiness_ttl
                            ? formik.errors.match_condition
                                ?.session_stickiness_ttl
                            : undefined
                        }
                        onChange={(e) =>
                          formik.setFieldValue(
                            'match_condition.session_stickiness_ttl',
                            (e.target as HTMLInputElement).valueAsNumber *
                              timeUnitFactorMap[ttlUnit]
                          )
                        }
                        value={
                          (formik.values.match_condition
                            .session_stickiness_ttl ?? 0) /
                          timeUnitFactorMap[ttlUnit]
                        }
                        label="Stickiness TTL"
                        labelTooltipText={ROUTE_COPY.Rule.Stickiness.TTL}
                        name="match_condition.session_stickiness_ttl"
                        onBlur={formik.handleBlur}
                        type="number"
                      />
                      <Autocomplete
                        onChange={(_, option) => {
                          const factor =
                            timeUnitFactorMap[option.key] /
                            timeUnitFactorMap[ttlUnit];

                          setTTLUnit(option.key);

                          if (
                            formik.values.match_condition.session_stickiness_ttl
                          ) {
                            const oldValue =
                              formik.values.match_condition
                                .session_stickiness_ttl;

                            formik.setFieldValue(
                              'match_condition.session_stickiness_ttl',
                              oldValue * factor
                            );
                          }
                        }}
                        value={timeUnitOptions.find(
                          (option) => option.key === ttlUnit
                        )}
                        disableClearable
                        label="test"
                        options={timeUnitOptions}
                        sx={{ marginTop: '45px !important', minWidth: '140px' }}
                        textFieldProps={{ hideLabel: true }}
                      />
                    </Stack>
                  )}
                </>
              )}
            </Stack>
          )}
        </Stack>
        <ActionsPanel
          primaryButtonProps={{
            disabled: isEditMode && !formik.dirty,
            label: isEditMode ? 'Save' : 'Add Rule',
            loading: formik.isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: onClose,
          }}
        />
      </form>
    </Drawer>
  );
};
