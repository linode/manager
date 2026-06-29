import { Autocomplete, TooltipIcon, Typography } from '@linode/ui';
import React from 'react';

interface StopSequencesControlProps {
  onChange: (value: string[] | undefined) => void;
  value: string[] | undefined;
}

export const StopSequencesControl = ({
  onChange,
  value,
}: StopSequencesControlProps) => {
  const sequences = value ?? [];

  const handleChange = (_: unknown, newValue: unknown) => {
    const strings = (newValue as { label: string; value: string }[]).map((v) =>
      typeof v === 'string' ? v : v.value
    );
    onChange(strings.length > 0 ? strings : undefined);
  };

  return (
    <div>
      <Typography
        sx={{ alignItems: 'center', display: 'flex' }}
        variant="body2"
      >
        Stop Sequences
        <TooltipIcon
          labelTooltipIconSize="small"
          status="info"
          sxTooltipIcon={{
            '& svg': { height: 16, width: 16 },
            marginLeft: '-4px',
          }}
          text="Text strings that immediately halt generation when produced. Useful for ending a response at a known marker."
        />
      </Typography>
      <Autocomplete
        clearOnBlur
        filterOptions={() => []}
        freeSolo
        label=""
        multiple
        onChange={handleChange}
        options={[]}
        placeholder="Type and press Enter to add…"
        textFieldProps={{
          hideLabel: true,
          InputProps: {
            sx: (theme) => ({
              borderRadius: theme.palette.mode === 'dark' ? 0 : '4px',
              minHeight: '34px',
            }),
          },
        }}
        value={sequences.map((s) => ({ label: s, value: s }))}
      />
    </div>
  );
};
