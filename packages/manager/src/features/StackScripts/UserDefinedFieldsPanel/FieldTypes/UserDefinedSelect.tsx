import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { InputLabel } from 'src/components/InputLabel';
import { Notice } from 'src/components/Notice/Notice';
import { Radio } from 'src/components/Radio/Radio';

interface Props {
  error?: string;
  field: UserDefinedField;
  isOptional: boolean;
  updateFormState: (key: string, value: any) => void;
  value: string;
}

export const UserDefinedSelect = (props: Props) => {
  const { error, field, isOptional, updateFormState, value } = props;

  const [oneof, setOneof] = React.useState<string[]>(field.oneof!.split(','));

  React.useEffect(() => {
    setOneof(field.oneof!.split(','));
  }, [field.oneof]);

  const handleSelectOneOf = (value: string) => {
    updateFormState(field.name, value);
  };

  const options = oneof.map((item) => ({ label: item }));

  if (oneof.length > 4) {
    return (
      <div>
        {error && <Notice spacingTop={8} text={error} variant="error" />}
        <Autocomplete
          disableClearable
          label={field.label}
          onChange={(_, option) => handleSelectOneOf(option.label)}
          options={options}
          value={options.find((option) => option.label === value)}
        />
      </div>
    );
  }
  return (
    <StyledRootDiv>
      {error && <Notice spacingTop={8} text={error} variant="error" />}
      <StyledInputLabel>
        {field.label}
        {!isOptional && '*'}
      </StyledInputLabel>

      {oneof.map((choice: string, index) => (
        <FormControlLabel
          control={
            <Radio
              checked={!!value && value === choice}
              data-qa-perm-none-radio
              name={choice}
              onChange={(e) => handleSelectOneOf(e.target.value)}
            />
          }
          key={index}
          label={choice}
          value={choice}
        />
      ))}
    </StyledRootDiv>
  );
};

const StyledInputLabel = styled(InputLabel, { label: 'StyledInputLabel' })({
  display: 'block',
  marginBottom: '4px',
});

const StyledRootDiv = styled('div', { label: 'StyledRootDiv' })(
  ({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    margin: `${theme.spacing(3)} 0 0`,
    marginTop: theme.spacing(2),
  })
);
