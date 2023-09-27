import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import Stack from '@mui/material/Stack';
import { useFormik } from 'formik';
import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Divider } from 'src/components/Divider';
import { Drawer } from 'src/components/Drawer';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { InputAdornment } from 'src/components/InputAdornment';
import { LinkButton } from 'src/components/LinkButton';
import { TextField } from 'src/components/TextField';
import { Toggle } from 'src/components/Toggle';
import { Typography } from 'src/components/Typography';

import { matchFieldMap } from '../RulesTable';
import { ServiceTargetSelect } from '../ServiceTargets/ServiceTargetSelect';

import type { MatchField, Route, RulePayload } from '@linode/api-v4';
import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';

interface Props {
  loadbalancerId: number;
  onClose: () => void;
  open: boolean;
  route: Route;
}

const defaultServiceTarget = {
  id: -1,
  percentage: 100,
};

export const AddRuleDrawer = (props: Props) => {
  const { loadbalancerId, onClose, open, route } = props;

  const formik = useFormik<RulePayload>({
    initialValues: {
      match_condition: {
        hostname: '',
        match_field: 'path_prefix',
        match_value: '',
        session_stickiness_cookie: null,
        session_stickiness_ttl: null,
      },
      service_targets: [defaultServiceTarget],
    },
    async onSubmit(values, formikHelpers) {
      alert(values);
    },
  });

  const options = Object.keys(matchFieldMap).map((key: MatchField) => ({
    label: matchFieldMap[key],
    value: key,
  }));

  const stickyOptions = [
    { label: 'Load Balancer Generated' },
    { label: 'Origin Generated' },
  ] as const;

  const cookieType = !formik.values.match_condition.session_stickiness_ttl
    ? stickyOptions[1]
    : stickyOptions[0];

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

  const isStickynessEnabled =
    Boolean(formik.values.match_condition.session_stickiness_cookie) ||
    Boolean(formik.values.match_condition.session_stickiness_ttl);

  return (
    <Drawer onClose={onClose} open={open} title="Add Rule" wide>
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={2}>
          <Stack bgcolor={(theme) => theme.bg.app} p={2.5} spacing={1.5}>
            <Typography variant="h3">Match Rule</Typography>
            <Typography>
              A rule consists of a match type, and a pattern to match on called
              a match value. Each rule can specify only one field or patter
              pair.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Autocomplete
                disableClearable
                label="Match Type"
                options={options}
                sx={{ minWidth: 200 }}
                textFieldProps={{ noMarginTop: true }}
              />
              <TextField
                containerProps={{ sx: { flexGrow: 1 } }}
                label="Match Value"
                noMarginTop
                placeholder="/my-path"
              />
            </Stack>
            <Stack alignItems="center" direction="row" gap={2}>
              <Typography>Routes to</Typography>
              <Divider light sx={{ flexGrow: 1 }} />
            </Stack>
            {formik.values.service_targets.map((serviceTargt, index) => (
              <Stack
                direction="row"
                key={`${serviceTargt.id}-${index}`}
                spacing={2}
              >
                <TextField
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                  hideLabel={index !== 0}
                  label="Percent"
                  max={100}
                  min={0}
                  noMarginTop
                  type="number"
                  value={formik.values.service_targets[index].percentage}
                />
                <ServiceTargetSelect
                  onChange={(serviceTarget) =>
                    formik.setFieldValue(
                      `service_targets[${index}].id`,
                      serviceTarget?.id ?? null
                    )
                  }
                  loadbalancerId={loadbalancerId}
                  sx={{ flexGrow: 1 }}
                  textFieldProps={{ hideLabel: index !== 0 }}
                  value={formik.values.service_targets[index].id}
                />
                <IconButton
                  sx={
                    index === 0
                      ? { marginTop: '24px !important', padding: 0 }
                      : { padding: 0 }
                  }
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
          <Stack spacing={1.5}>
            <Typography variant="h3">Session Stickiness</Typography>
            <Typography>
              Controls how subsequent requests from the same client are routed
              when when selecting a backend target. When disabled, no session
              information is saved.
            </Typography>
            <FormControlLabel
              control={
                <Toggle
                  onChange={(_, checked) => {
                    if (checked) {
                      formik.setFieldValue(
                        'match_condition.session_stickiness_ttl',
                        8
                      );
                    } else {
                      formik.setFieldValue(
                        'match_condition.session_stickiness_ttl',
                        null
                      );
                      formik.setFieldValue(
                        'match_condition.session_stickiness_cookie',
                        null
                      );
                    }
                  }}
                  checked={isStickynessEnabled}
                  sx={{ marginLeft: -1.5 }}
                />
              }
              label="Use Session Stickiness"
            />
            {isStickynessEnabled && (
              <>
                <Autocomplete
                  onChange={(_, option) => {
                    if (option?.label === 'Load Balancer Generated') {
                      formik.setFieldValue(
                        'match_condition.session_stickiness_ttl',
                        8
                      );
                      formik.setFieldValue(
                        'match_condition.session_stickiness_cookie',
                        ''
                      );
                    } else {
                      formik.setFieldValue(
                        'match_condition.session_stickiness_ttl',
                        ''
                      );
                      formik.setFieldValue(
                        'match_condition.session_stickiness_cookie',
                        'my-cookie'
                      );
                    }
                  }}
                  disableClearable
                  label="Cookie type"
                  options={stickyOptions}
                  textFieldProps={{ noMarginTop: true }}
                  value={cookieType}
                />
                {!formik.values.match_condition.session_stickiness_ttl && (
                  <TextField
                    value={
                      formik.values.match_condition.session_stickiness_cookie
                    }
                    label="Cookie"
                    name="match_condition.session_stickiness_cookie"
                    noMarginTop
                    onChange={formik.handleChange}
                  />
                )}
                {!formik.values.match_condition.session_stickiness_cookie && (
                  <Stack alignItems="flex-end" direction="row" spacing={1}>
                    <TextField
                      value={
                        formik.values.match_condition.session_stickiness_ttl
                      }
                      label="Stickyness TTL"
                      name="match_condition.session_stickiness_ttl"
                      noMarginTop
                      onChange={formik.handleChange}
                    />
                    <Autocomplete
                      options={[
                        { label: 'Hours' },
                        { label: 'Days' },
                        { label: 'Minutes' },
                      ]}
                      disableClearable
                      label="test"
                      textFieldProps={{ hideLabel: true, noMarginTop: true }}
                      value="Hours"
                    />
                  </Stack>
                )}
              </>
            )}
          </Stack>
        </Stack>
        <ActionsPanel
          primaryButtonProps={{
            label: 'Add Rule',
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
