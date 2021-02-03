import { Formik, FormikProps } from 'formik';
import { parse as parseIP, parseCIDR } from 'ipaddr.js';
import {
  FirewallRuleProtocol,
  FirewallRuleType
} from '@linode/api-v4/lib/firewalls';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Select from 'src/components/EnhancedSelect';
import { Item } from 'src/components/EnhancedSelect/Select';
import MultipleIPInput from 'src/components/MultipleIPInput/MultipleIPInput';
import Notice from 'src/components/Notice';
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
  protocolOptions
} from 'src/features/Firewalls/shared';
import capitalize from 'src/utilities/capitalize';
import { ExtendedIP, stringToExtendedIP } from 'src/utilities/ipUtils';
import { ExtendedFirewallRule } from './firewallRuleEditor';
import { Category, FirewallRuleError } from './shared';

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
  type: string;
  ports?: string;
  addresses: string;
  protocol: string;
  label: string;
  description: string;
}

export type CombinedProps = Props;

const FirewallRuleDrawer: React.FC<CombinedProps> = props => {
  const { isOpen, onClose, category, mode, ruleToModify } = props;

  // Custom IPs are tracked separately from the form. The <MultipleIPs />
  // component consumes this state. We use this on form submission if the
  // `addresses` form value is "ip/netmask", which indicates the user has
  // intended to specify custom IPs.
  const [ips, setIPs] = React.useState<ExtendedIP[]>([{ address: '' }]);

  // Reset state. If we're in EDIT mode, set IPs to the addresses of the rule we're modifying
  // (along with any errors we may have).
  React.useEffect(() => {
    if (mode === 'edit' && ruleToModify) {
      setIPs(getInitialIPs(ruleToModify));
    } else {
      setIPs([{ address: '' }]);
    }
  }, [mode, ruleToModify]);

  const title =
    mode === 'create' ? `Add an ${capitalize(category)} Rule` : 'Edit Rule';

  const addressesLabel = category === 'inbound' ? 'source' : 'destination';

  const onValidate = ({ ports, protocol, label, description }: Form) => {
    // The validated IPs may have errors, so set them to state so we see the errors.
    const validatedIPs = validateIPs(ips);
    setIPs(validatedIPs);

    return {
      ...validateForm(protocol, ports, label, description),
      // This is a bit of a trick. If this function DOES NOT return an empty object, Formik will call
      // `onSubmit()`. If there are IP errors, we add them to the return object so Formik knows there
      // is an issue with the form.
      ...validatedIPs.filter(thisIP => Boolean(thisIP.error))
    };
  };

  const onSubmit = (values: Form) => {
    const ports = values.ports;
    const protocol = values.protocol as FirewallRuleProtocol;
    const addresses = formValueToIPs(values.addresses, ips);

    const payload: FirewallRuleType = {
      ports,
      protocol,
      addresses
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
        {formikProps => {
          return (
            <FirewallRuleForm
              category={category}
              addressesLabel={addressesLabel}
              ips={ips}
              setIPs={setIPs}
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
    marginTop: theme.spacing(2)
  }
}));

interface FirewallRuleFormProps extends FormikProps<Form> {
  ips: ExtendedIP[];
  setIPs: (ips: ExtendedIP[]) => void;
  addressesLabel: string;
  mode: Mode;
  category: Category;
  ruleErrors?: FirewallRuleError[];
}

const FirewallRuleForm: React.FC<FirewallRuleFormProps> = React.memo(props => {
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
    mode,
    ruleErrors,
    setFieldError,
    touched,
    category
  } = props;

  // Set form field errors for each error we have (except "addresses" errors, which are handled
  // by IP Error state).
  React.useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    ruleErrors?.forEach(thisError => {
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
        setFieldValue('label', `allow-${category}-${item?.label}`);
      }

      // Pre-populate other form values if selecting a pre-defined type.
      if (selectedType !== 'custom') {
        // All predefined FW types use the TCP protocol.
        setFieldValue('protocol', 'TCP');
        // All predefined FW types use all IPv4 and IPv6.
        setFieldValue('addresses', 'all');
        // Use the port for the selected type.
        setFieldValue('ports', portPresets[selectedType]);
      }
    },
    [formTouched, setFieldValue, touched, category]
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
      }
    },
    [formTouched, setFieldValue]
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

  const handleIPChange = React.useCallback(
    (_ips: ExtendedIP[]) => {
      if (!formTouched) {
        setFormTouched(true);
      }
      setIPs(_ips);
    },
    [formTouched, setIPs]
  );

  const addressesValue = React.useMemo(() => {
    return (
      addressOptions.find(
        thisOption => thisOption.value === values.addresses
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
      <TextField
        label="Port Range"
        name="ports"
        placeholder="Enter a port range..."
        aria-label="Port range for firewall rule"
        value={values.ports}
        errorText={errors.ports}
        onChange={handleTextFieldChange}
        onBlur={handleBlur}
        disabled={values.protocol === 'ICMP'}
        tooltipText={
          values.protocol === 'ICMP'
            ? 'Ports are not allowed for ICMP protocols.'
            : undefined
        }
      />
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
      <ActionsPanel>
        <Button
          buttonType="primary"
          onClick={() => handleSubmit()}
          disabled={!formTouched}
          data-qa-submit
        >
          {mode === 'create' ? 'Add Rule' : 'Edit Rule'}
        </Button>
      </ActionsPanel>
    </form>
  );
});

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
    addresses: formValueToIPs(values.addresses, ips)
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
export const validateIPs = (ips: ExtendedIP[]): ExtendedIP[] => {
  return ips.map(({ address }) => {
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
      // Empty addresses are OK for the sake of validating the form.
      if (address !== '') {
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
  type: '',
  ports: '',
  addresses: '',
  protocol: '',
  label: '',
  description: ''
};

const getInitialFormValues = (ruleToModify?: ExtendedFirewallRule): Form => {
  if (!ruleToModify) {
    return initialValues;
  }

  return {
    ports: ruleToModify.ports || '',
    protocol: ruleToModify.protocol,
    addresses: getInitialAddressFormValue(ruleToModify.addresses),
    type: predefinedFirewallFromRule(ruleToModify) || '',
    label: ruleToModify?.label || '',
    description: ruleToModify?.description || ''
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
  ruleToModify.errors?.forEach(thisError => {
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

  if ((protocol === 'TCP' || protocol === 'UDP') && !ports) {
    errors.ports = 'Ports are required for TCP and UDP protocols.';
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
