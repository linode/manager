import { styled } from '@mui/material/styles';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import Select from 'src/components/EnhancedSelect';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import { Notice } from 'src/components/Notice/Notice';
import { Radio } from 'src/components/Radio/Radio';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { RadioGroup } from 'src/components/RadioGroup';
import {
  addressOptions,
  firewallOptionItemsShort,
  portPresets,
  protocolOptions,
} from 'src/features/Firewalls/shared';
import { capitalize } from 'src/utilities/capitalize';
import { ipFieldPlaceholder } from 'src/utilities/ipUtils';

import { enforceIPMasks } from './FirewallRuleDrawer.utils';
import { PORT_PRESETS, PORT_PRESETS_ITEMS } from './shared';

import type { FirewallRuleFormProps } from './FirewallRuleDrawer.types';
import type { Item } from 'src/components/EnhancedSelect/Select';
import type { ExtendedIP } from 'src/utilities/ipUtils';

const ipNetmaskTooltipText =
  'If you do not specify a mask, /32 will be assumed for IPv4 addresses and /128 will be assumed for IPv6 addresses.';

export const FirewallRuleForm = React.memo((props: FirewallRuleFormProps) => {
  const {
    addressesLabel,
    category,
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
    ips,
    mode,
    presetPorts,
    ruleErrors,
    setFieldError,
    setFieldValue,
    setIPs,
    setPresetPorts,
    status,
    touched,
    values,
  } = props;

  const hasCustomInput = presetPorts.some(
    (thisPort) => thisPort.value === PORT_PRESETS['CUSTOM'].value
  );

  const hasSelectedAllPorts = presetPorts.some(
    (thisPort) => thisPort.value === PORT_PRESETS['ALL'].value
  );

  // If ALL is selected, don't show additional options
  // (because they won't do anything)
  const portOptions = hasSelectedAllPorts
    ? PORT_PRESETS_ITEMS.filter(
        (thisItem) => thisItem.value === PORT_PRESETS['ALL'].value
      )
    : PORT_PRESETS_ITEMS;

  // This is an edge case; if there's an error for the Ports field
  // but CUSTOM isn't selected, the error won't be visible to the user.
  const generalPortError = !hasCustomInput ? errors.ports : undefined;

  // Set form field errors for each error we have (except "addresses" errors, which are handled
  // by IP Error state).
  React.useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    ruleErrors?.forEach((thisError) => {
      if (thisError.formField !== 'addresses') {
        setFieldError(thisError.formField, thisError.reason);
      }
    });
  }, [ruleErrors, setFieldError]);

  // These handlers are all memoized because the form was laggy when I tried them inline.
  const handleTypeChange = React.useCallback(
    (item: Item | null) => {
      const selectedType = item?.value;

      // If the user re-selects the same preset or selectedType is undefined, don't do anything
      if (selectedType === values.type || !selectedType) {
        return;
      }

      setFieldValue('type', selectedType);

      if (!touched.label) {
        setFieldValue(
          'label',
          `${values.action.toLocaleLowerCase()}-${category}-${item?.label}`
        );
      }

      // Pre-populate other form values if selecting a pre-defined type.
      if (selectedType !== 'custom') {
        // All predefined FW types use the TCP protocol.
        setFieldValue('protocol', 'TCP');
        // All predefined FW types use all IPv4 and IPv6.
        setFieldValue('addresses', 'all');
        // Use the port for the selected type.
        setPresetPorts([PORT_PRESETS[portPresets[selectedType]]]);
      }
    },
    [
      setFieldValue,
      touched,
      category,
      setPresetPorts,
      values.action,
      values.type,
    ]
  );

  const handleTextFieldChange = React.useCallback(
    (e: React.ChangeEvent) => {
      handleChange(e);
    },
    [handleChange]
  );

  const handleProtocolChange = React.useCallback(
    (item: Item | null) => {
      setFieldValue('protocol', item?.value);
      if (item?.value === 'ICMP' || item?.value === 'IPENCAP') {
        // Submitting the form with ICMP or IPENCAP and defined ports causes an error
        setFieldValue('ports', '');
        setPresetPorts([]);
      }
    },
    [setFieldValue, setPresetPorts]
  );

  const handleAddressesChange = React.useCallback(
    (item: Item | null) => {
      setFieldValue('addresses', item?.value);
      // Reset custom IPs
      setIPs([{ address: '' }]);
    },
    [setFieldValue, setIPs]
  );

  const handleActionChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, value: 'ACCEPT' | 'DROP') => {
      setFieldValue('action', value);
    },
    [setFieldValue]
  );

  const handleIPChange = React.useCallback(
    (_ips: ExtendedIP[]) => {
      setIPs(_ips);
    },
    [setIPs]
  );

  const handleIPBlur = (_ips: ExtendedIP[]) => {
    const _ipsWithMasks = enforceIPMasks(_ips);

    setIPs(_ipsWithMasks);
  };

  const handlePortPresetChange = React.useCallback(
    (items: Item<string>[]) => {
      // If the user is selecting "ALL", it doesn't make sense
      // to show additional selections.
      if (
        items.some((thisItem) => thisItem.value === PORT_PRESETS['ALL'].value)
      ) {
        setPresetPorts([PORT_PRESETS['ALL']]);
        setFieldValue('ports', '');
        return;
      }
      setPresetPorts(items);
      if (!items.some((thisItem) => thisItem.value === 'CUSTOM')) {
        setFieldValue('ports', '');
      }
    },
    [setPresetPorts, setFieldValue]
  );

  const addressesValue = React.useMemo(() => {
    return (
      addressOptions.find(
        (thisOption) => thisOption.value === values.addresses
      ) || null
    );
  }, [values]);

  return (
    <form onSubmit={handleSubmit}>
      {status && (
        <Notice data-qa-error error key={status} text={status.generalError} />
      )}
      <Select
        aria-label="Preset for firewall rule"
        isClearable={false}
        label="Preset"
        name="type"
        onBlur={handleBlur}
        onChange={handleTypeChange}
        options={firewallOptionItemsShort}
        placeholder="Select a rule preset..."
      />
      <TextField
        aria-label="Label for firewall rule"
        errorText={errors.label}
        label="Label"
        name="label"
        onBlur={handleBlur}
        onChange={handleTextFieldChange}
        placeholder="Enter a label..."
        required
        value={values.label}
      />
      <TextField
        aria-label="Description for firewall rule"
        errorText={errors.description}
        label="Description"
        name="description"
        onBlur={handleBlur}
        onChange={handleTextFieldChange}
        placeholder="Enter a description..."
        value={values.description}
      />
      <Select
        aria-label="Select rule protocol."
        errorText={errors.protocol}
        isClearable={false}
        label="Protocol"
        name="protocol"
        onBlur={handleBlur}
        onChange={handleProtocolChange}
        options={protocolOptions}
        placeholder="Select a protocol..."
        required
        value={protocolOptions.find((p) => p.value === values.protocol)}
      />
      <Select
        textFieldProps={{
          helperText: ['ICMP', 'IPENCAP'].includes(values.protocol)
            ? `Ports are not allowed for ${values.protocol} protocols.`
            : undefined,
        }}
        disabled={['ICMP', 'IPENCAP'].includes(values.protocol)}
        errorText={generalPortError}
        isMulti
        label="Ports"
        onChange={handlePortPresetChange}
        options={portOptions}
        required
        value={presetPorts}
      />
      {hasCustomInput ? (
        <TextField
          aria-label="Custom port range for firewall rule"
          errorText={errors.ports}
          label="Custom Port Range"
          name="ports"
          onBlur={handleBlur}
          onChange={handleTextFieldChange}
          placeholder="Enter a custom port range..."
          value={values.ports}
        />
      ) : null}
      <Select
        aria-label={`Select rule ${addressesLabel}s.`}
        errorText={errors.addresses}
        isClearable={false}
        label={`${capitalize(addressesLabel)}s`}
        name="addresses"
        onBlur={handleBlur}
        onChange={handleAddressesChange}
        options={addressOptions}
        placeholder={`Select ${addressesLabel}s...`}
        required
        value={addressesValue}
      />
      {/* Show this field only if "IP / Netmask has been selected." */}
      {values.addresses === 'ip/netmask' && (
        <StyledMultipleIPInput
          aria-label="IP / Netmask for Firewall rule"
          inputProps={{ autoFocus: true }}
          ips={ips}
          onBlur={handleIPBlur}
          onChange={handleIPChange}
          placeholder={ipFieldPlaceholder}
          title="IP / Netmask"
          tooltip={ipNetmaskTooltipText}
        />
      )}
      <StyledDiv>
        <Typography>
          <strong>Action</strong>
        </Typography>
        <RadioGroup
          aria-label="action"
          name="action"
          onChange={handleActionChange}
          row
          value={values.action}
        >
          <FormControlLabel control={<Radio />} label="Accept" value="ACCEPT" />
          <FormControlLabel control={<Radio />} label="Drop" value="DROP" />
          <Typography style={{ paddingTop: 4 }}>
            This will take precedence over the Firewall&rsquo;s {category}{' '}
            policy.
          </Typography>
        </RadioGroup>
      </StyledDiv>

      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'submit',
          label: mode === 'create' ? 'Add Rule' : 'Add Changes',
          onClick: () => handleSubmit(),
        }}
      />
    </form>
  );
});

const StyledDiv = styled('div', { label: 'StyledDiv' })(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const StyledMultipleIPInput = styled(MultipleIPInput, {
  label: 'StyledMultipleIPInput',
})(({ theme }) => ({
  marginTop: theme.spacing(2),
}));
