import { handleFormikBlur } from './formikTrimUtil';

const setFieldValueMock = vi.fn();
const handleBlurMock = vi.fn();

const textfieldMock = {
  target: { name: 'usernameField', type: 'text', value: '  test-user  ' },
} as React.FocusEvent<HTMLInputElement>;
const emailFieldMock = {
  target: {
    name: 'emailField',
    type: 'email',
    value: '  test-user@example.com  ',
  },
} as React.FocusEvent<HTMLInputElement>;

describe('handleFormikBlur', () => {
  it('should trim leading and trailing space from a username TextField', () => {
    handleFormikBlur(textfieldMock, {
      handleBlur: handleBlurMock,
      setFieldValue: setFieldValueMock,
    });

    expect(setFieldValueMock).toHaveBeenCalledWith(
      'usernameField',
      'test-user'
    );
    expect(handleBlurMock).toHaveBeenCalledWith(textfieldMock);
  });

  it('should trim leading and trailing space from an email TextField', () => {
    handleFormikBlur(emailFieldMock, {
      handleBlur: handleBlurMock,
      setFieldValue: setFieldValueMock,
    });

    expect(setFieldValueMock).toHaveBeenCalledWith(
      'emailField',
      'test-user@example.com'
    );
    expect(handleBlurMock).toHaveBeenCalledWith(emailFieldMock);
  });
});
