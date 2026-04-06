import { TextField as _TextField, Autocomplete } from '@linode/ui';
import * as React from 'react';

import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import { extendedIPToString, stringToExtendedIP } from 'src/utilities/ipUtils';

import { transferHelperText as helperText } from '../../domainUtils';
import { resolve, shouldResolve } from './DomainRecordDrawerUtils';

import type {
  DomainRecordDrawerProps,
  EditableDomainFields,
} from './DomainRecordDrawer';
import type { ExtendedIP } from 'src/utilities/ipUtils';

interface AdjustedTextFieldProps {
  errorText?: string;
  helperText?: string;
  label: string;
  max?: number;
  min?: number;
  multiline?: boolean;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  trimmed?: boolean;
  value: null | number | string;
}

interface NumberFieldProps extends AdjustedTextFieldProps {
  defaultValue?: number;
}

export const TextField = ({ label, ...rest }: AdjustedTextFieldProps) => (
  <_TextField data-qa-target={label} label={label} {...rest} />
);

export const NameOrTargetField = ({
  domain,
  errorText,
  field,
  label,
  multiline,
  onBlur,
  onChange,
  type,
  value,
}: {
  domain: DomainRecordDrawerProps['domain'];
  errorText?: string;
  field: 'name' | 'target';
  label: string;
  multiline?: boolean;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type: DomainRecordDrawerProps['type'];
  value: string;
}) => {
  const hasAliasToResolve =
    value && value.indexOf('@') >= 0 && shouldResolve(type, field);

  return (
    <TextField
      errorText={errorText}
      helperText={hasAliasToResolve ? resolve(value, domain) : undefined}
      label={label}
      multiline={multiline}
      onBlur={onBlur}
      onChange={onChange}
      placeholder={
        shouldResolve(type, field) ? 'hostname or @ for root' : undefined
      }
      value={value}
    />
  );
};

export const ServiceField = (props: {
  errorText?: string;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
}) => <TextField label="Service" {...props} />;

export const DomainTransferField = ({
  errorText,
  onChange,
  value,
}: {
  errorText?: string;
  onChange: (ips: string[]) => void;
  value: EditableDomainFields['axfr_ips'];
}) => {
  const finalIPs = (value ?? ['']).map(stringToExtendedIP);

  const handleTransferUpdate = (transferIPs: ExtendedIP[]) => {
    const axfrIps =
      transferIPs.length > 0 ? transferIPs.map(extendedIPToString) : [''];
    onChange(axfrIps);
  };

  return (
    <MultipleIPInput
      error={errorText}
      helperText={helperText}
      ips={finalIPs}
      onChange={handleTransferUpdate}
      title="Domain Transfer IPs"
    />
  );
};

const MSSelect = ({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  value: number;
}) => {
  const MSSelectOptions = [
    { label: 'Default', value: 0 },
    { label: '30 seconds', value: 30 },
    { label: '2 minutes', value: 120 },
    { label: '5 minutes', value: 300 },
    { label: '1 hour', value: 3600 },
    { label: '2 hours', value: 7200 },
    { label: '4 hours', value: 14400 },
    { label: '8 hours', value: 28800 },
    { label: '16 hours', value: 57600 },
    { label: '1 day', value: 86400 },
    { label: '2 days', value: 172800 },
    { label: '4 days', value: 345600 },
    { label: '1 week', value: 604800 },
    { label: '2 weeks', value: 1209600 },
    { label: '4 weeks', value: 2419200 },
  ];

  const defaultOption = MSSelectOptions.find((eachOption) => {
    return eachOption.value === value;
  });

  return (
    <Autocomplete
      disableClearable
      label={label}
      onChange={(_, selected) => onChange(selected.value)}
      options={MSSelectOptions}
      textFieldProps={{
        dataAttrs: {
          'data-qa-domain-select': label,
        },
      }}
      value={defaultOption}
    />
  );
};

export const RefreshRateField = (props: {
  onChange: (value: number) => void;
  value: number;
}) => <MSSelect label="Refresh Rate" {...props} />;

export const RetryRateField = (props: {
  onChange: (value: number) => void;
  value: number;
}) => <MSSelect label="Retry Rate" {...props} />;

export const DefaultTTLField = (props: {
  onChange: (value: number) => void;
  value: number;
}) => <MSSelect label="Default TTL" {...props} />;

export const TTLField = (props: {
  onChange: (value: number) => void;
  value: number;
}) => <MSSelect label="TTL" {...props} />;

export const ExpireField = ({
  onChange,
  value,
}: {
  onChange: (value: number) => void;
  value: number;
}) => {
  const rateOptions = [
    { label: 'Default', value: 0 },
    { label: '1 week', value: 604800 },
    { label: '2 weeks', value: 1209600 },
    { label: '4 weeks', value: 2419200 },
  ];

  const defaultRate = rateOptions.find((eachRate) => {
    return eachRate.value === value;
  });

  return (
    <Autocomplete
      disableClearable
      label="Expire Rate"
      onChange={(_, selected) => onChange(selected.value)}
      options={rateOptions}
      textFieldProps={{
        dataAttrs: {
          'data-qa-domain-select': 'Expire Rate',
        },
      }}
      value={defaultRate}
    />
  );
};

export const ProtocolField = ({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) => {
  const protocolOptions = [
    { label: 'tcp', value: 'tcp' },
    { label: 'udp', value: 'udp' },
    { label: 'xmpp', value: 'xmpp' },
    { label: 'tls', value: 'tls' },
    { label: 'smtp', value: 'smtp' },
  ];

  const defaultProtocol = protocolOptions.find((eachProtocol) => {
    return eachProtocol.value === value;
  });

  return (
    <Autocomplete
      disableClearable
      label="Protocol"
      onChange={(_, selected) => onChange(selected.value)}
      options={protocolOptions}
      textFieldProps={{
        dataAttrs: {
          'data-qa-domain-select': 'Protocol',
        },
      }}
      value={defaultProtocol}
    />
  );
};

export const TagField = ({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) => {
  const tagOptions = [
    { label: 'issue', value: 'issue' },
    { label: 'issuewild', value: 'issuewild' },
    { label: 'iodef', value: 'iodef' },
  ];

  const defaultTag = tagOptions.find((eachTag) => {
    return eachTag.value === value;
  });

  return (
    <Autocomplete
      disableClearable
      label="Tag"
      onChange={(_, selected) => onChange(selected.value)}
      options={tagOptions}
      textFieldProps={{
        dataAttrs: {
          'data-qa-domain-select': 'caa tag',
        },
      }}
      value={defaultTag}
    />
  );
};

const NumberField = ({
  errorText,
  label,
  onBlur,
  onChange,
  value,
  ...rest
}: NumberFieldProps) => {
  return (
    <_TextField
      data-qa-target={label}
      errorText={errorText}
      label={label}
      onBlur={onBlur}
      onChange={onChange}
      type="number"
      value={value}
      {...rest}
    />
  );
};

export const PortField = (props: {
  errorText?: string;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: number | string;
}) => <NumberField label="Port" {...props} />;

export const PriorityField = (props: {
  errorText?: string;
  label: string;
  max: number;
  min: number;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: number | string;
}) => <NumberField {...props} />;

export const WeightField = (props: {
  errorText?: string;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: number | string;
}) => <NumberField label="Weight" {...props} />;
