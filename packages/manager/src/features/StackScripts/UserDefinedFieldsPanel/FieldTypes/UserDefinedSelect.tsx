import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import * as React from 'react';
import FormControlLabel from 'src/components/core/FormControlLabel';
import InputLabel from 'src/components/core/InputLabel';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { WrapperMenuItem } from 'src/components/MenuItem/MenuItem';
import { Notice } from 'src/components/Notice/Notice';
import { Radio } from 'src/components/Radio/Radio';
import { TextField } from 'src/components/TextField';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: `${theme.spacing(3)} 0 0`,
    display: 'flex',
    flexDirection: 'column',
    marginTop: '16px',
  },
  radioGroupLabel: {
    display: 'block',
    marginBottom: '4px',
  },
}));

interface Props {
  updateFormState: (key: string, value: any) => void;
  value: string;
  field: UserDefinedField;
  isOptional: boolean;
  error?: string;
}

export const UserDefinedSelect = (props: Props) => {
  const classes = useStyles();

  const { field, value, error, isOptional, updateFormState } = props;

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
        {error && <Notice error text={error} spacingTop={8} />}
        <TextField
          label={field.label}
          onChange={handleSelectOneOf}
          value={value}
          select
        >
          {oneof.map((choice: string, index) => {
            return (
              <WrapperMenuItem value={choice} key={index}>
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
      {error && <Notice error text={error} spacingTop={8} />}
      <InputLabel className={classes.radioGroupLabel}>
        {field.label}
        {!isOptional && '*'}
      </InputLabel>

      {oneof.map((choice: string, index) => (
        <FormControlLabel
          value={choice}
          key={index}
          control={
            <Radio
              name={choice}
              checked={!!value && value === choice}
              onChange={handleSelectOneOf}
              data-qa-perm-none-radio
            />
          }
          label={choice}
        />
      ))}
    </div>
  );
};
