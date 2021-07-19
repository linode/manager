import { handleAPIErrors } from './formikErrorUtils';

const errorWithoutField = [{ reason: 'Internal server error' }];
const errorWithField = [
  { reason: 'Invalid credit card number', field: 'data.card_number' },
];

const setFieldError = jest.fn();
const setError = jest.fn();

describe('handleAPIErrors', () => {
  it('should handle api error with a field', () => {
    handleAPIErrors(errorWithField, setFieldError, setError);
    expect(setFieldError).toHaveBeenCalledWith(
      'card_number',
      errorWithField[0].reason
    );
    expect(setError).not.toHaveBeenCalled();
  });

  it('should handle a general api error', () => {
    handleAPIErrors(errorWithoutField, setFieldError, setError);
    expect(setFieldError).not.toHaveBeenCalledWith();
    expect(setError).toHaveBeenCalledWith(errorWithoutField[0].reason);
  });
});
