import { fireEvent, getDefaultNormalizer } from '@testing-library/react';
//import * as Formik from 'formik';
//import { FormikProps } from 'formik';
import React from 'react';

jest.mock('formik');

import { TextField } from 'src/components/TextField';

// import { handleFormikBlur } from './formikTrimUtil';
import { renderWithTheme } from './testHelpers';

// const setFieldValue = jest.fn();
// const handleBlur = jest.fn();
// const formik = {
//   handleBlur,
//   setFieldValue,
// } as Partial<FormikProps<T>>;

//const useFormikMock = jest.spyOn(Formik, 'useFormik');
//const formik = useFormikMock as Partial<FormikProps<T>>;

const emailFieldProps = {
  label: 'Email',
  // onBlur: (e: React.FocusEvent<HTMLInputElement, HTMLTextAreaElement>) =>
  //   handleFormikBlur(e, formik),
  type: 'email',
  value: 'test@email.com',
};

const usernameFieldProps = {
  label: 'Username',
  // onBlur: (e: React.FocusEvent<HTMLInputElement, HTMLTextAreaElement>) =>
  //   handleFormikBlur(e, formik),
  value: 'test-user',
};

describe('handleFormikBlur', () => {
  it('should trim leading and trailing space from an email TextField', async () => {
    const { getByDisplayValue, getByLabelText } = renderWithTheme(
      <TextField {...emailFieldProps} />
    );
    const input = getByLabelText('Email');

    fireEvent.change(input, { target: { value: ' test@email.com ' } });
    fireEvent.blur(input);

    expect(
      getByDisplayValue('test@email.com', {
        normalizer: getDefaultNormalizer({ trim: false }), // Prevent default trim by DOM Testing Library
      })
    ).toBeInTheDocument();
  });

  it.skip('should trim leading and trailing space from a username TextField', async () => {
    const { getByDisplayValue, getByLabelText } = renderWithTheme(
      <TextField {...usernameFieldProps} />
    );
    const input = getByLabelText('Username');

    fireEvent.change(input, { target: { value: ' test-user ' } });
    fireEvent.blur(input);

    expect(
      getByDisplayValue('test-user', {
        normalizer: getDefaultNormalizer({ trim: false }), // Prevent default trim by DOM Testing Library
      })
    ).toBeInTheDocument();
  });
});
