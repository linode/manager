import {
  FirewallPolicyType,
  FirewallRuleProtocol,
  FirewallRuleType,
} from '@linode/api-v4/lib/firewalls';
import { Formik, FormikProps } from 'formik';
import { parse as parseIP, parseCIDR } from 'ipaddr.js';
import { uniq } from 'ramda';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormControlLabel from 'src/components/core/FormControlLabel';
import RadioGroup from 'src/components/core/RadioGroup';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Select from 'src/components/EnhancedSelect';
import { Item } from 'src/components/EnhancedSelect/Select';
import MultipleIPInput from 'src/components/MultipleIPInput/MultipleIPInput';
import Notice from 'src/components/Notice';
import Radio from 'src/components/Radio';
import TextField from 'src/components/TextField';
import {
  addressOptions,
  allIPs,
  allIPv4,
  allIPv6,
  allowAllIPv4,
  allowAllIPv6,
  allowsAllIPs,
  firewallOptionItemsShort,
  portPresets,
  predefinedFirewallFromRule,
  protocolOptions,
} from 'src/features/Firewalls/shared';
import capitalize from 'src/utilities/capitalize';
import { ExtendedIP, stringToExtendedIP } from 'src/utilities/ipUtils';
import { ExtendedFirewallRule } from './firewallRuleEditor';
import {
  Category,
  FirewallRuleError,
  PORT_PRESETS,
  PORT_PRESETS_ITEMS,
  sortString,
} from './shared';

export type Mode = 'create' | 'edit';

export const IP_ERROR_MESSAGE =
  'Must be a valid IPv4 or IPv6 address or range.';

// =============================================================================
// <FirewallRuleDrawer />
// =============================================================================
interface Props {
  category: Category;
  mode: Mode;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: 'inbound' | 'outbound', rule: FirewallRuleType) => void;
  ruleToModify?: ExtendedFirewallRule;
}

interface Form {
  action: FirewallPolicyType;
  type: string;
  ports?: string;
  addresses: string;
  protocol: string;
  label: string;
  description: string;
}

export type CombinedProps = Props;

const FirewallRuleDrawer: React.FC<CombinedProps> = (props) => {
  const { isOpen, onClose, category, mode, ruleToModify } = props;

  // Custom IPs are tracked separately from the form. The <MultipleIPs />
  // component consumes this state. We use this on form submission if the
  // `addresses` form value is "ip/netmask", which indicates the user has
  // intended to specify custom IPs.
  const [ips, setIPs] = React.useState<ExtendedIP[]>([{ address: '' }]);

  // Firewall Ports, like IPs, are tracked separately. The form.values state value
  // tracks the custom user input; the Item[] array of port presets in the multi-select
  // is stored here.
  const [presetPorts, setPresetPorts] = React.useState<Item<string>[]>([]);

  // Reset state. If we're in EDIT mode, set IPs to the addresses of the rule we're modifying
  // (along with any errors we may have).
  React.useEffect(() => {
    if (mode === 'edit' && ruleToModify) {
      setIPs(getInitialIPs(ruleToModify));
      setPresetPorts(portStringToItems(ruleToModify.ports)[0]);
    } else if (isOpen) {
      setPresetPorts([]);
    } else {
      setIPs([{ address: '' }]);
    }
  }, [mode, isOpen, ruleToModify]);

  const title =
    mode === 'create' ? `Add an ${capitalize(category)} Rule` : 'Edit Rule';

  const addressesLabel = category === 'inbound' ? 'source' : 'destination';

  const onValidate = ({
    ports,
    protocol,
    label,
    description,
    addresses,
  }: Form) => {
    // The validated IPs may have errors, so set them to state so we see the errors.
    const validatedIPs = validateIPs(ips, {
      // eslint-disable-next-line sonarjs/no-duplicate-string
      allowEmptyAddress: addresses !== 'ip/netmask',
    });
    setIPs(validatedIPs);

    const _ports = itemsToPortString(presetPorts, ports);

    return {
      ...validateForm(protocol, _ports, label, description),
      // This is a bit of a trick. If this function DOES NOT return an empty object, Formik will call
      // `onSubmit()`. If there are IP errors, we add them to the return object so Formik knows there
      // is an issue with the form.
      ...validatedIPs.filter((thisIP) => Boolean(thisIP.error)),
    };
  };

  const onSubmit = (values: Form) => {
    const ports = itemsToPortString(presetPorts, values.ports);
    const protocol = values.protocol as FirewallRuleProtocol;
    const addresses = formValueToIPs(values.addresses, ips);

    const payload: FirewallRuleType = {
      ports,
      protocol,
      addresses,
      action: values.action,
    };

    if (values.label) {
      payload.label = values.label;
    }

    if (values.description) {
      payload.description = values.description;
    }

    props.onSubmit(category, payload);
    onClose();
  };

  return (
    <Drawer title={title} open={isOpen} onClose={onClose}>
      <Formik
        initialValues={getInitialFormValues(ruleToModify)}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={onSubmit}
        validate={onValidate}
      >
        {(formikProps) => {
          return (
            <FirewallRuleForm
              category={category}
              addressesLabel={addressesLabel}
              ips={ips}
              setIPs={setIPs}
              presetPorts={presetPorts}
              setPresetPorts={setPresetPorts}
              mode={mode}
              ruleErrors={ruleToModify?.errors}
              {...formikProps}
            />
          );
        }}
      </Formik>
      <Typography variant="body1">
        Rule changes don&apos;t take effect immediately. You can add or delete
        rules before saving all your changes to this Firewall.
      </Typography>
    </Drawer>
  );
};

export default React.memo(FirewallRuleDrawer);

// =============================================================================
// <FirewallRuleForm />
// =============================================================================
const useStyles = makeStyles((theme: Theme) => ({
  ipSelect: {
    marginTop: theme.spacing(2),
  },
  actionSection: {
    marginTop: theme.spacing(2),
  },
}));

interface FirewallRuleFormProps extends FormikProps<Form> {
  ips: ExtendedIP[];
  setIPs: (ips: ExtendedIP[]) => void;
  presetPorts: Item<string>[];
  setPresetPorts: (selected: Item<string>[]) => void;
  addressesLabel: string;
  mode: Mode;
  category: Category;
  ruleErrors?: FirewallRuleError[];
}

const FirewallRuleForm: React.FC<FirewallRuleFormProps> = React.memo(
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
    const generalPortError = !hasCustomInput && errors.ports;

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
        setFieldValue('type', selectedType);

        if (!selectedType) {
          return;
        }

        if (!formTouched) {
          setFormTouched(true);
        }

        if (!touched.label) {
          setFieldValue('label', `accept-${category}-${item?.label}`);
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
      [formTouched, setFieldValue, touched, category, setPresetPorts]
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
        if (item?.value === 'ICMP') {
          // Submitting the form with ICMP and defined ports causes an error
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
          value={
            values.protocol
              ? { label: values.protocol, value: values.protocol }
              : undefined
          }
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
          disabled={values.protocol === 'ICMP'}
          textFieldProps={{
            helperText:
              values.protocol === 'ICMP'
                ? 'Ports are not allowed for ICMP protocols.'
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
            inputProps={{ autoFocus: true }}
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
              This will take precedence over the Firewall's {category} policy.
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

// =============================================================================
// Utilities
// =============================================================================
/**
 * Derive the appropriate value of the "Type" field based on selected form
 * values and IP addresses.
 *
 * Example: A user selects the "HTTPS" type. The appropriate value is "HTTPS".
 * Next, the user modifies the allowed IP addresses. Now the appropriate value
 * is "custom", since the form no longer matches the predefined "HTTPS" type.
 * Finally, the user changes their mind and removes the custom IP selection.
 * The form again matches the "HTTPS" type, so the correct value is "HTTPS".
 */
export const deriveTypeFromValuesAndIPs = (values: Form, ips: ExtendedIP[]) => {
  if (values.type === 'custom') {
    return 'custom';
  }

  const protocol = values.protocol as FirewallRuleProtocol;

  const predefinedFirewall = predefinedFirewallFromRule({
    ports: values.ports,
    protocol,
    addresses: formValueToIPs(values.addresses, ips),
    action: 'ACCEPT',
  });

  if (predefinedFirewall) {
    return predefinedFirewall;
  } else if (
    values.protocol?.length > 0 ||
    (values.ports && values.ports?.length > 0) ||
    values.addresses?.length > 0
  ) {
    return 'custom';
  }
  return null;
};

/**
 * Matches potential form values to the correct "addresses" payload.
 */
export const formValueToIPs = (
  formValue: string,
  ips: ExtendedIP[]
): FirewallRuleType['addresses'] => {
  switch (formValue) {
    case 'all':
      return allIPs;
    case 'allIPv4':
      return { ipv4: [allIPv4] };
    case 'allIPv6':
      return { ipv6: [allIPv6] };
    default:
      // The user has selected "IP / Netmask" and entered custom IPs, so we need
      // to separate those into v4 and v6 addresses.
      return classifyIPs(ips);
  }
};

// Adds an `error` message to each invalid IP in the list.
export const validateIPs = (
  ips: ExtendedIP[],
  options?: { allowEmptyAddress: boolean }
): ExtendedIP[] => {
  return ips.map(({ address }) => {
    if (!options?.allowEmptyAddress && !address) {
      return { address, error: 'Please enter an IP address.' };
    }
    // We accept plain IPs as well as ranges (i.e. CIDR notation). Ipaddr.js has separate parsing
    // methods for each, so we check for a netmask to decide the method to use.
    const [, mask] = address.split('/');
    try {
      if (mask) {
        parseCIDR(address);
      } else {
        parseIP(address);
      }
    } catch (err) {
      if (address) {
        return { address, error: IP_ERROR_MESSAGE };
      }
    }
    return { address };
  });
};

/**
 * Given an array of IP addresses, filter out invalid addresses and categorize
 * them by "ipv4" and "ipv6."
 */
export const classifyIPs = (ips: ExtendedIP[]) => {
  return ips.reduce<{ ipv4?: string[]; ipv6?: string[] }>(
    (acc, { address }) => {
      // Unfortunately ipaddr.js can't determine the "type" of an IPv6 address with a mask, so we
      // need to parse the base address only and THEN determine the type.
      const [base] = address.split('/');
      try {
        const parsed = parseIP(base);
        const type = parsed.kind();
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type]!.push(address);
      } catch {
        // No need to do anything here (validation will have already caught errors).
      }
      return acc;
    },
    {}
  );
};

const initialValues: Form = {
  action: 'ACCEPT',
  type: '',
  ports: '',
  addresses: '',
  protocol: '',
  label: '',
  description: '',
};

const getInitialFormValues = (ruleToModify?: ExtendedFirewallRule): Form => {
  if (!ruleToModify) {
    return initialValues;
  }

  return {
    action: ruleToModify.action,
    ports: portStringToItems(ruleToModify.ports)[1],
    protocol: ruleToModify.protocol,
    addresses: getInitialAddressFormValue(ruleToModify.addresses),
    type: predefinedFirewallFromRule(ruleToModify) || '',
    label: ruleToModify?.label || '',
    description: ruleToModify?.description || '',
  };
};

export const getInitialAddressFormValue = (
  addresses: ExtendedFirewallRule['addresses']
): string => {
  if (allowsAllIPs(addresses)) {
    return 'all';
  }

  if (allowAllIPv4(addresses)) {
    return 'allIPv4';
  }

  if (allowAllIPv6(addresses)) {
    return 'allIPv6';
  }

  return 'ip/netmask';
};

// Get a list of Extended IP from an existing Firewall rule. This is necessary when opening the
// drawer/form to modify an existing rule.
export const getInitialIPs = (
  ruleToModify: ExtendedFirewallRule
): ExtendedIP[] => {
  const { addresses } = ruleToModify;

  const extendedIPv4 = (addresses?.ipv4 ?? []).map(stringToExtendedIP);
  const extendedIPv6 = (addresses?.ipv6 ?? []).map(stringToExtendedIP);

  const ips: ExtendedIP[] = [...extendedIPv4, ...extendedIPv6];

  // eslint-disable-next-line no-unused-expressions
  ruleToModify.errors?.forEach((thisError) => {
    const { formField, ip } = thisError;

    if (formField !== 'addresses' || !ip) {
      return;
    }

    /**
     * This is a trip, but we may have to offset the IP index. An example: The IPs we give to the
     * API might look like:
     *
     *  {
     *    ipv4: ['1.2.3.4'],
     *    ipv6: ['INVALID_IP']
     *  }
     *
     * The API will return an error explaining that `ipv6[0]` is invalid. In this form, our list of
     * IPs looks like: ['1.2.3.4', 'INVALID_IP'], so we can't rely solely on the index from the
     * API... we've got to offset it by the length of the v4 IPs. This works because we place v4 IPs
     * first in the list when modifying an existing rule.
     */
    const index =
      ip.type === 'ipv4' ? ip.idx : addresses?.ipv4?.length ?? 0 + ip.idx;

    ips[index].error = IP_ERROR_MESSAGE;
  });

  return ips;
};

/**
 * Take the value of the Ports select (which contains presets)
 * and combine it with any custom user input to create a string
 * that the API will accept.
 *
 * Examples:
 *
 * portSelect = [ { value: 22, label: 'ssh' }, { value: 443, label: 'https' }]
 * values.ports = "8080, 1313-1515"
 *
 * output: '22, 443, 1313-1515, 8080'
 */
export const itemsToPortString = (
  items: Item<string>[],
  portInput?: string
): string | undefined => {
  // If a user has selected ALL, just return that; anything else in the string
  // will be redundant.
  if (items.findIndex((thisItem) => thisItem.value === 'ALL') > -1) {
    return '1-65535';
  }
  // Take the values, excluding "CUSTOM" since that just indicates there was custom user input.
  const presets = items.map((i) => i.value).filter((i) => i !== 'CUSTOM');
  const customArray = (portInput ?? '')
    .split(',')
    .map((port) => port.trim())
    .filter(Boolean);
  return uniq([...presets, ...customArray])
    .sort(sortString)
    .join(', ');
};

/**
 *
 * Inverse of itemsToPortString. Takes a string from an API response (or row value)
 * and converts it to Item<string>[] and a custom input string.
 */
export const portStringToItems = (
  portString?: string
): [Item<string>[], string] => {
  // Handle empty input
  if (!portString) {
    return [[], ''];
  }

  // If this string is included, all ports are allowed.
  if (portString.match(/1-65535/)) {
    return [[PORT_PRESETS['ALL']], ''];
  }

  const ports = portString.split(',').map((p) => p.trim());
  const items: Item<string>[] = [];
  const customInput: string[] = [];

  ports.forEach((thisPort) => {
    const preset = PORT_PRESETS[thisPort];
    if (preset) {
      items.push(preset);
    } else {
      customInput.push(thisPort);
    }
  });
  if (customInput.length > 0) {
    items.push({ label: 'Custom', value: 'CUSTOM' });
  }
  return [uniq(items), customInput.join(', ')];
};

export const validateForm = (
  protocol?: string,
  ports?: string,
  label?: string,
  description?: string
) => {
  const errors: Partial<Form> = {};

  if (!protocol) {
    // eslint-disable-next-line
    errors.protocol = 'Protocol is required.';
  }

  if (protocol === 'ICMP' && ports) {
    errors.ports = 'Ports are not allowed for ICMP protocols.';
    return errors;
  }

  if (ports && !ports.match(/^([0-9\-]+,?\s?)+$/)) {
    errors.ports =
      'Ports must be an integer, range of integers, or a comma-separated list of integers.';
  }

  if (description && description.length > 100) {
    errors.description = 'Description must be 1-100 characters.';
  }

  if (label && (label.length < 3 || label.length > 32)) {
    errors.label = 'Label must be 3-32 characters.';
  }

  return errors;
};
