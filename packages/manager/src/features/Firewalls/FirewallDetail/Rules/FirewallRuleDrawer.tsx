import { Formik, FormikProps } from 'formik';
import { parse as parseIP, parseCIDR } from 'ipaddr.js';
import {
  FirewallRuleProtocol,
  FirewallRuleType
} from 'linode-js-sdk/lib/firewalls';
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
import { FirewallRuleWithStatus } from './firewallRuleEditor';
import { Category, FirewallRuleError } from './shared';

export type Mode = 'create' | 'edit';

const IP_ERROR_MESSAGE = 'Must be a valid IPv4 or IPv6 address or range.';

// =============================================================================
// <FirewallRuleDrawer />
// =============================================================================
interface Props {
  category: Category;
  mode: Mode;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: 'inbound' | 'outbound', rule: FirewallRuleType) => void;
  ruleToModify?: FirewallRuleWithStatus;
}

interface Form {
  type: string;
  ports: string;
  addresses: string;
  protocol: string;
}

export type CombinedProps = Props;

const FirewallRuleDrawer: React.FC<CombinedProps> = props => {
  const { isOpen, onClose, category, mode, ruleToModify } = props;

  // Custom IPs are tracked separately from the form. The <MultipleIPs />
  // component consumes this state. We use this on form submission if the
  // `addresses` form value is "ip/netmask", which indicates the user has
  // intended to specify custom IPs.
  const [ips, setIPs] = React.useState<ExtendedIP[]>([{ address: '' }]);

  // Reset IP and IP Error state. If we're in EDIT mode:
  //   1. Set IPs to the addresses of the rule we're modifying.
  //   2. Set IP Errors if we have any.
  // If we're NOT in EDIT mode, this state is reset.
  React.useEffect(() => {
    setIPs(getInitialIPs(mode, ruleToModify));
  }, [mode, ruleToModify]);

  const title =
    mode === 'create' ? `Add an ${capitalize(category)} Rule` : 'Edit Rule';

  const addressesLabel = category === 'inbound' ? 'source' : 'destination';

  const onValidate = ({ addresses, ports, protocol }: Form) => {
    const validatedIPs = validateIPs(ips);
    setIPs(validatedIPs);

    const errors = validatedIPs.filter(thisIP => Boolean(thisIP.error));

    return {
      ...validateForm(protocol, ports),
      ...errors
    };
  };

  const onSubmit = (values: Form) => {
    const ports = values.ports;
    const protocol = values.protocol as FirewallRuleProtocol;
    const addresses = formValueToIPs(values.addresses, ips);

    const payload = {
      ports,
      protocol,
      addresses
    };

    // The API will return an error if a `ports` attribute is present on a payload for an ICMP rule.
    if (protocol === 'ICMP' && ports === '') {
      delete payload.ports;
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
        Rule changes don't take effect immediately. You can add or delete rules
        before saving all your changes to this Firewall.
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
  ruleErrors?: FirewallRuleError[];
}

const typeOptions = [
  ...firewallOptionItemsShort,
  { label: 'Custom', value: 'custom' }
];

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
    setFieldError
  } = props;

  // Set form field errors for each error we have (except "addresses" errors, which are handled
  // by IP Error state).
  React.useEffect(() => {
    ruleErrors?.forEach(thisError => {
      if (thisError.formField !== 'addresses') {
        setFieldError(thisError.formField, thisError.reason);
      }
    });
  }, [ruleErrors]);

  // These handlers are all memoized because the form was laggy when I tried them inline.
  const handleTypeChange = React.useCallback((item: Item | null) => {
    const selectedType = item?.value;
    setFieldValue('type', selectedType);

    if (!selectedType) {
      return;
    }

    if (!formTouched) {
      setFormTouched(true);
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
  }, []);

  const handleProtocolChange = React.useCallback(
    (item: Item | null) => {
      if (!formTouched) {
        setFormTouched(true);
      }

      setFieldValue('protocol', item?.value);
    },
    [formTouched]
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
    [ips, formTouched]
  );

  const handlePortsChange = React.useCallback(
    (e: React.ChangeEvent) => {
      if (!formTouched) {
        setFormTouched(true);
      }
      handleChange(e);
    },
    [formTouched]
  );

  const handleIPChange = React.useCallback(
    (newIPs: ExtendedIP[]) => {
      if (!formTouched) {
        setFormTouched(true);
      }
      setIPs(newIPs);

      // @todo: maybe validate here
    },
    [formTouched, ips]
  );

  const addressesValue = React.useMemo(() => {
    return (
      addressOptions.find(
        thisOption => thisOption.value === values.addresses
      ) || null
    );
  }, [values]);

  const typeValue = React.useMemo(() => {
    const _type = deriveTypeFromValuesAndIPs(values, ips);
    return typeOptions.find(thisOption => thisOption.value === _type) || null;
  }, [values, ips, typeOptions]);

  return (
    <form onSubmit={handleSubmit}>
      {status && (
        <Notice key={status} text={status.generalError} error data-qa-error />
      )}
      <Select
        label="Type"
        name="type"
        placeholder="Select a rule type..."
        aria-label="Select rule type."
        options={typeOptions}
        value={typeValue}
        onChange={handleTypeChange}
        isClearable={false}
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
      />
      <TextField
        label="Port Range"
        name="ports"
        placeholder="Enter a port range..."
        aria-label="Port range for firewall rule"
        value={values.ports}
        errorText={errors.ports}
        onChange={handlePortsChange}
        onBlur={handleBlur}
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
      />
      {/* Show this field only if "IP / Netmask has been selected." */}
      {values.addresses === 'ip/netmask' && (
        <MultipleIPInput
          title="IP / Netmask"
          aria-label="IP / Netmask for firewall rule"
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
    values.ports?.length > 0 ||
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
      return { ipv4: [allIPv4], ipv6: [] };
    case 'allIPv6':
      return { ipv4: [], ipv6: [allIPv6] };
    default:
      // The user has selected "IP / Netmask" and entered custom IPs, so we need
      // to separate those into v4 and v6 addresses.
      return classifyIPs(ips);
  }
};

export const validateIPs = (ips: ExtendedIP[]): ExtendedIP[] => {
  return ips.map(({ address }) => {
    const [, mask] = address.split('/');
    try {
      if (mask) {
        parseCIDR(address);
      } else {
        parseIP(address);
      }
    } catch (err) {
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
  return ips.reduce<{ ipv4: string[]; ipv6: string[] }>(
    (acc, { address }) => {
      // It's possible to enter a subnet, e.g. 1.0.0.0/16. Ipaddr.js does not parse this
      // correctly, so we split out the range before doing the classification.
      const [base] = address.split('/');
      try {
        const parsed = parseIP(base);
        const type = parsed.kind();
        acc[type].push(address);
      } catch {
        // No need to do anything here (validation will have already caught errors).
      }
      return acc;
    },
    { ipv4: [], ipv6: [] }
  );
};

const initialValues: Form = {
  type: '',
  ports: '',
  addresses: '',
  protocol: ''
};

const getInitialFormValues = (ruleToModify?: FirewallRuleWithStatus): Form => {
  if (!ruleToModify) {
    return initialValues;
  }

  return {
    ports: ruleToModify.ports,
    protocol: ruleToModify.protocol,
    addresses: getInitialAddressFormValue(ruleToModify.addresses),
    type: predefinedFirewallFromRule(ruleToModify) || ''
  };
};

export const getInitialAddressFormValue = (
  addresses: FirewallRuleWithStatus['addresses']
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

export const getInitialIPs = (
  mode: Mode,
  ruleToModify?: FirewallRuleWithStatus
): ExtendedIP[] => {
  if (mode !== 'edit' || !ruleToModify) {
    return [{ address: '' }];
  }

  const { addresses } = ruleToModify;

  const ips: ExtendedIP[] = [
    ...addresses?.ipv4?.map(stringToExtendedIP),
    ...addresses?.ipv6?.map(stringToExtendedIP)
  ];

  ruleToModify.errors?.forEach(thisError => {
    const { formField, ip } = thisError;

    if (formField !== 'addresses' || !ip) {
      return;
    }
    const index =
      ip.type === 'ipv4' ? ip.idx : addresses?.ipv4?.length ?? 0 + ip.idx;

    ips[index].error = IP_ERROR_MESSAGE;
  });

  return ips;
};

export const getInitialIPErrors = (
  mode: Mode,
  ruleToModify?: FirewallRuleWithStatus
): Record<number, string> => {
  if (mode !== 'edit' || !ruleToModify?.errors) {
    return [];
  }

  return ruleToModify.errors.reduce<Record<number, string>>(
    (acc, thisError) => {
      const { formField, ip } = thisError;
      if (formField !== 'addresses' || !ip) {
        return acc;
      }

      const { type, idx } = ip;
      const ipv4 = ruleToModify?.addresses?.ipv4;
      const index = type === 'ipv4' ? idx : ipv4?.length ?? 0 + idx;
      acc[index] = IP_ERROR_MESSAGE;

      return acc;
    },
    {}
  );
};

export const validateForm = (protocol?: string, ports?: string) => {
  const errors: Partial<Form> = {};

  if (!protocol) {
    errors.protocol = 'Protocol is required.';
  }

  if (protocol === 'ICMP' && ports) {
    errors.ports = 'Ports are not allowed for ICMP protocols.';
    return errors;
  }

  if ((protocol === 'TCP' || protocol === 'UDP') && !ports) {
    errors.ports = 'Ports required for TCP and UDP protocols.';
    return errors;
  }

  if (ports && !ports.match(/^[0-9,-]+$/)) {
    errors.ports =
      'Ports be an integer, range of integers, or a comma-separated list of integers.';
  }

  return errors;
};
