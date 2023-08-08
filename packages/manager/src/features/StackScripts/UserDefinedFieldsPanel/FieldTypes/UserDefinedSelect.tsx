import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { FormControlLabel } from 'src/components/FormControlLabel';
import { InputLabel } from 'src/components/InputLabel';
import { WrapperMenuItem } from 'src/components/MenuItem/MenuItem';
import { Notice } from 'src/components/Notice/Notice';
import { Radio } from 'src/components/Radio/Radio';
import { TextField } from 'src/components/TextField';

const useStyles = makeStyles((theme: Theme) => ({
  radioGroupLabel: {
    display: 'block',
    marginBottom: '4px',
  },
  root: {
    display: 'flex',
    flexDirection: 'column',
    margin: `${theme.spacing(3)} 0 0`,
    marginTop: '16px',
  },
}));

interface Props {
  error?: string;
  field: UserDefinedField;
  isOptional: boolean;
  updateFormState: (key: string, value: any) => void;
  value: string;
}

export const UserDefinedSelect = (props: Props) => {
  const classes = useStyles();

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
        {error && <Notice error spacingTop={8} text={error} />}
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
    <div className={classes.root}>
      {error && <Notice error spacingTop={8} text={error} />}
      <InputLabel className={classes.radioGroupLabel}>
        {field.label}
        {!isOptional && '*'}
      </InputLabel>

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
    </div>
  );
};
