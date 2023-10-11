import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { FormControlLabel } from 'src/components/FormControlLabel';
import { InputLabel } from 'src/components/InputLabel';
import { WrapperMenuItem } from 'src/components/MenuItem/MenuItem';
import { Notice } from 'src/components/Notice/Notice';
import { Radio } from 'src/components/Radio/Radio';
import { TextField } from 'src/components/TextField';

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

  const handleSelectOneOf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = e.target.value;
    updateFormState(field.name, selectedValue);
  };

  if (oneof.length > 4) {
    return (
      <div>
        {error && <Notice spacingTop={8} text={error} variant="error" />}
        <TextField
          label={field.label}
          onChange={handleSelectOneOf}
          select
          value={value}
        >
          {oneof.map((choice: string, index) => {
            return (
              <WrapperMenuItem key={index} value={choice}>
                {choice}
              </WrapperMenuItem>
            );
          })}
        </TextField>
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
              onChange={handleSelectOneOf}
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

const StyledRootDiv = styled('div', { label: 'StyledRootDiv' })(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  margin: `${theme.spacing(3)} 0 0`,
  marginTop: theme.spacing(2),
}));