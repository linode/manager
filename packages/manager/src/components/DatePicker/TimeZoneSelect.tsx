import { DateTime } from 'luxon';
import React from 'react';

import { timezones } from 'src/assets/timezones/timezones';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';

type Timezone = typeof timezones[number];

interface TimeZoneSelectProps {
  disabled?: boolean;
  errorText?: string;
  label?: string;
  onChange: (timezone: string) => void;
  value: null | string;
}

const getOptionLabel = ({ label, offset }: Timezone) => {
  const minutes = (Math.abs(offset) % 60).toLocaleString(undefined, {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  const hours = Math.floor(Math.abs(offset) / 60);
  const isPositive = Math.abs(offset) === offset ? '+' : '-';

  return `(GMT ${isPositive}${hours}:${minutes}) ${label}`;
};

const getTimezoneOptions = () => {
  return timezones
    .map((tz) => {
      const offset = DateTime.now().setZone(tz.name).offset;
      const label = getOptionLabel({ ...tz, offset });
      return { label, offset, value: tz.name };
    })
    .sort((a, b) => a.offset - b.offset);
};

const timezoneOptions = getTimezoneOptions();

export const TimeZoneSelect = ({
  disabled = false,
  errorText,
  label = 'Timezone',
  onChange,
  value,
}: TimeZoneSelectProps) => {
  return (
    <Autocomplete
      value={
        timezoneOptions.find((option) => option.value === value) ?? undefined
      }
      autoHighlight
      disableClearable
      disabled={disabled}
      errorText={errorText}
      fullWidth
      label={label}
      onChange={(e, option) => onChange(option?.value || '')}
      options={timezoneOptions}
      placeholder="Choose a Timezone"
    />
  );
};
