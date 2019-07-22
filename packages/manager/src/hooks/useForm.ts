import * as React from 'react';

type UpdateField<T> = (field: keyof T, value: any) => void;
type ResetForm = () => void;
type SetValues<T> = React.Dispatch<React.SetStateAction<T>>;

export const useForm = <T extends {}>(
  initialForm: T
): [T, UpdateField<T>, ResetForm, SetValues<T>] => {
  const [form, setValues] = React.useState<T>(initialForm);

  const updateField = (field: keyof T, value: any) => {
    setValues(prevForm => ({
      ...prevForm,
      [field]: value
    }));
  };

  const resetForm = () => setValues(initialForm);

  return [form, updateField, resetForm, setValues];
};
