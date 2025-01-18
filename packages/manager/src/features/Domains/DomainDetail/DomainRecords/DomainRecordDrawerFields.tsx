import { TextField as _TextField, Autocomplete } from '@linode/ui';
import * as React from 'react';

import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import { extendedIPToString, stringToExtendedIP } from 'src/utilities/ipUtils';

import { transferHelperText as helperText } from '../../domainUtils';

import type {
  EditableDomainFields,
  EditableRecordFields,
} from './DomainRecordDrawer';
import type { ExtendedIP } from 'src/utilities/ipUtils';

export interface AdjustedTextFieldProps {
  errorText?: string;
  field: keyof EditableDomainFields | keyof EditableRecordFields; // @todo: [purvesh] - Need to remove this prop
  helperText?: string;
  label: string;
  max?: number;
  min?: number;
  multiline?: boolean;
  onBlur?: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  trimmed?: boolean;
  value?: null | number | string;
}

export const TextField = ({
  errorText,
  helperText,
  label,
  multiline,
  onBlur,
  onChange,
  placeholder,
  trimmed,
  value,
}: AdjustedTextFieldProps) => (
  <_TextField
    data-qa-target={label}
    errorText={errorText}
    helperText={helperText}
    label={label}
    multiline={multiline}
    onBlur={onBlur}
    onChange={onChange}
    placeholder={placeholder}
    trimmed={trimmed}
    value={value}
  />
);

export const DomainTransferField = ({
  errorText,
  onChange,
  value,
}: {
  errorText?: string;
  onChange: (ips: ExtendedIP[]) => void;
  value: EditableDomainFields['axfr_ips'];
}) => {
  const finalIPs = (value ?? ['']).map(stringToExtendedIP);

  const handleTransferUpdate = (transferIPs: ExtendedIP[]) => {
    const axfrIps: any =
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

export const MSSelect = ({
  // field,
  fn,
  label,
  value,
}: {
  // field: keyof EditableDomainFields | keyof EditableRecordFields;
  fn: (value: number) => void;
  label: string;
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
    return (
      eachOption.value === value
      // defaultTo(
      //   defaultFieldsState(props)[field],
      //   (state.fields as EditableDomainFields & EditableRecordFields)[field]
      // )
    );
  });

  return (
    <Autocomplete
      textFieldProps={{
        dataAttrs: {
          'data-qa-domain-select': label,
        },
      }}
      disableClearable
      label={label}
      onChange={(_, selected) => fn(selected.value)}
      options={MSSelectOptions}
      value={defaultOption}
    />
  );
};

export const RefreshRateField = ({
  onChange,
  value,
}: {
  onChange: (value: number) => void;
  value: number;
}) => <MSSelect fn={onChange} label="Refresh Rate" value={value} />;

export const RetryRateField = ({
  onChange,
  value,
}: {
  onChange: (value: number) => void;
  value: number;
}) => <MSSelect fn={onChange} label="Retry Rate" value={value} />;

export const TTLField = ({
  onChange,
  value,
}: {
  onChange: (value: number) => void;
  value: number;
}) => <MSSelect fn={onChange} label="TTL" value={value} />;
