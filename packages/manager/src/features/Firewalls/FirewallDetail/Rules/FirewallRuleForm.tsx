import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormControlLabel from 'src/components/core/FormControlLabel';
import MultipleIPInput from 'src/components/MultipleIPInput/MultipleIPInput';
import Radio from 'src/components/Radio';
import RadioGroup from 'src/components/core/RadioGroup';
import Select from 'src/components/EnhancedSelect';
import TextField from 'src/components/TextField';
import Typography from 'src/components/core/Typography';
import { capitalize } from 'src/utilities/capitalize';
import { ipFieldPlaceholder } from 'src/utilities/ipUtils';
import { makeStyles } from '@mui/styles';
import { Notice } from 'src/components/Notice/Notice';
import { PORT_PRESETS, PORT_PRESETS_ITEMS } from './shared';
import { enforceIPMasks } from './FirewallRuleDrawer.utils';
import {
  addressOptions,
  firewallOptionItemsShort,
  portPresets,
  protocolOptions,
} from 'src/features/Firewalls/shared';
import type { ExtendedIP } from 'src/utilities/ipUtils';
import type { FirewallRuleFormProps } from './FirewallRuleDrawer.types';
import type { Item } from 'src/components/EnhancedSelect/Select';
import type { Theme } from '@mui/material/styles';

const ipNetmaskTooltipText =
  'If you do not specify a mask, /32 will be assumed for IPv4 addresses and /128 will be assumed for IPv6 addresses.';

const useStyles = makeStyles((theme: Theme) => ({
  ipSelect: {
    marginTop: theme.spacing(2),
  },
  actionSection: {
    marginTop: theme.spacing(2),
  },
}));

export const FirewallRuleForm: React.FC<FirewallRuleFormProps> = React.memo(
  (props) => {
    const classes = useStyles();

    // This will be set to `true` once a form field has been touched. This is used to disable the
    // "Submit" button unless there have been changes to the form.
    const [formTouched, setFormTouched] = React.useState<boolean>(false);

    const {
      values,
      errors,
      status,
      handleChange,
      handleBlur,
      handleSubmit,
      setFieldValue,
      addressesLabel,
      ips,
      setIPs,
      presetPorts,
      setPresetPorts,
      mode,
      ruleErrors,
      setFieldError,
      touched,
      category,
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

        // If the user re-selectes the same preset, don't do anything
        if (selectedType === values.type) {
          return;
        }

        setFieldValue('type', selectedType);

        if (!selectedType) {
          return;
        }

        if (!formTouched) {
          setFormTouched(true);
        }

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
        formTouched,
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
        if (!formTouched) {
          setFormTouched(true);
        }
        handleChange(e);
      },
      [formTouched, handleChange]
    );

    const handleProtocolChange = React.useCallback(
      (item: Item | null) => {
        if (!formTouched) {
          setFormTouched(true);
        }

        setFieldValue('protocol', item?.value);
        if (item?.value === 'ICMP' || item?.value === 'IPENCAP') {
          // Submitting the form with ICMP or IPENCAP and defined ports causes an error
          setFieldValue('ports', '');
          setPresetPorts([]);
        }
      },
      [formTouched, setFieldValue, setPresetPorts]
    );

    const handleAddressesChange = React.useCallback(
      (item: Item | null) => {
        if (!formTouched) {
          setFormTouched(true);
        }

        setFieldValue('addresses', item?.value);
        // Reset custom IPs
        setIPs([{ address: '' }]);
      },
      [formTouched, setFieldValue, setFormTouched, setIPs]
    );

    const handleActionChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>, value: 'ACCEPT' | 'DROP') => {
        if (!formTouched) {
          setFormTouched(true);
        }

        setFieldValue('action', value);
      },
      [formTouched, setFieldValue, setFormTouched]
    );

    const handleIPChange = React.useCallback(
      (_ips: ExtendedIP[]) => {
        if (!formTouched) {
          setFormTouched(true);
        }
        setIPs(_ips);
      },
      [formTouched, setIPs]
    );

    const handleIPBlur = (_ips: ExtendedIP[]) => {
      const _ipsWithMasks = enforceIPMasks(_ips);

      setIPs(_ipsWithMasks);
    };

    const handlePortPresetChange = React.useCallback(
      (items: Item<string>[]) => {
        if (!formTouched) {
          setFormTouched(true);
        }
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
      [setPresetPorts, formTouched, setFieldValue]
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
          <Notice key={status} text={status.generalError} error data-qa-error />
        )}
        <Select
          label="Preset"
          name="type"
          placeholder="Select a rule preset..."
          aria-label="Preset for firewall rule"
          options={firewallOptionItemsShort}
          onChange={handleTypeChange}
          isClearable={false}
          onBlur={handleBlur}
        />
        <TextField
          label="Label"
          name="label"
          placeholder="Enter a label..."
          aria-label="Label for firewall rule"
          value={values.label}
          errorText={errors.label}
          onChange={handleTextFieldChange}
          onBlur={handleBlur}
        />
        <TextField
          label="Description"
          name="description"
          placeholder="Enter a description..."
          aria-label="Description for firewall rule"
          value={values.description}
          errorText={errors.description}
          onChange={handleTextFieldChange}
          onBlur={handleBlur}
        />
        <Select
          label="Protocol"
          name="protocol"
          placeholder="Select a protocol..."
          aria-label="Select rule protocol."
          value={protocolOptions.find((p) => p.value === values.protocol)}
          errorText={errors.protocol}
          options={protocolOptions}
          onChange={handleProtocolChange}
          onBlur={handleBlur}
          isClearable={false}
        />
        <Select
          isMulti
          label="Ports"
          errorText={generalPortError}
          value={presetPorts}
          options={portOptions}
          onChange={handlePortPresetChange}
          disabled={['ICMP', 'IPENCAP'].includes(values.protocol)}
          textFieldProps={{
            helperText: ['ICMP', 'IPENCAP'].includes(values.protocol)
              ? `Ports are not allowed for ${values.protocol} protocols.`
              : undefined,
          }}
        />
        {hasCustomInput ? (
          <TextField
            label="Custom Port Range"
            name="ports"
            placeholder="Enter a custom port range..."
            aria-label="Custom port range for firewall rule"
            value={values.ports}
            errorText={errors.ports}
            onChange={handleTextFieldChange}
            onBlur={handleBlur}
          />
        ) : null}
        <Select
          label={`${capitalize(addressesLabel)}s`}
          name="addresses"
          placeholder={`Select ${addressesLabel}s...`}
          aria-label={`Select rule ${addressesLabel}s.`}
          options={addressOptions}
          value={addressesValue}
          onChange={handleAddressesChange}
          onBlur={handleBlur}
          isClearable={false}
        />
        {/* Show this field only if "IP / Netmask has been selected." */}
        {values.addresses === 'ip/netmask' && (
          <MultipleIPInput
            title="IP / Netmask"
            aria-label="IP / Netmask for Firewall rule"
            className={classes.ipSelect}
            ips={ips}
            onChange={handleIPChange}
            onBlur={handleIPBlur}
            inputProps={{ autoFocus: true }}
            tooltip={ipNetmaskTooltipText}
            placeholder={ipFieldPlaceholder}
          />
        )}
        <div className={classes.actionSection}>
          <Typography>
            <strong>Action</strong>
          </Typography>

          <RadioGroup
            aria-label="action"
            name="action"
            value={values.action}
            onChange={handleActionChange}
            row
          >
            <FormControlLabel
              value="ACCEPT"
              label="Accept"
              control={<Radio />}
            />
            <FormControlLabel value="DROP" label="Drop" control={<Radio />} />
            <Typography style={{ paddingTop: 4 }}>
              This will take precedence over the Firewall&rsquo;s {category}{' '}
              policy.
            </Typography>
          </RadioGroup>
        </div>

        <ActionsPanel>
          <Button
            buttonType="primary"
            onClick={() => handleSubmit()}
            disabled={!formTouched}
            data-qa-submit
          >
            {mode === 'create' ? 'Add Rule' : 'Add Changes'}
          </Button>
        </ActionsPanel>
      </form>
    );
  }
);
