import { createToast } from './asyncToasts';

describe('createToast', () => {
  it('should handle case with both failure and success options as true or empty objects', () => {
    const trueOptions = { failure: true, success: true };
    const emptyObjectOptions = { failure: {}, success: {} };

    [trueOptions, emptyObjectOptions].forEach((options) => {
      const result = createToast(options);
      const expected = {
        failure: {
          invertVariant: false,
          message: expect.any(Function),
          persist: false,
        },
        success: {
          invertVariant: false,
          message: expect.any(Function),
          persist: false,
        },
      };

      expect(result).toEqual(expected);
    });
  });

  it('should handle case with only failure option as true or empty object or with success as false', () => {
    const scenarios = [
      { failure: true },
      { failure: {} },
      { failure: true, success: false },
      { failure: {}, success: false },
    ];

    scenarios.forEach((options) => {
      const result = createToast(options);
      const expected = {
        failure: {
          invertVariant: false,
          message: expect.any(Function),
          persist: false,
        },
      };

      expect(result).toEqual(expected);
    });
  });

  it('should handle case with only success option as true or empty object or with failure as false', () => {
    const scenarios = [
      { success: true },
      { success: {} },
      { failure: false, success: true },
      { failure: false, success: {} },
    ];

    scenarios.forEach((options) => {
      const result = createToast(options);
      const expected = {
        success: {
          invertVariant: false,
          message: expect.any(Function),
          persist: false,
        },
      };

      expect(result).toEqual(expected);
    });
  });

  it('should return an empty object if both failure and success are false or not provided', () => {
    const falseOptions = { failure: false, success: false };
    const emptyOptions = {};
    [falseOptions, emptyOptions].forEach((options) => {
      const result = createToast(options);

      expect(result).toEqual({});
    });
  });

  it('should handle case with failure as true and success as false', () => {
    const options = { failure: true, success: false };
    const result = createToast(options);
    const expected = {
      failure: {
        invertVariant: false,
        message: expect.any(Function),
        persist: false,
      },
    };

    expect(result).toEqual(expected);
  });

  it('should handle case with success as true and failure as false', () => {
    const options = { failure: false, success: true };
    const result = createToast(options);
    const expected = {
      success: {
        invertVariant: false,
        message: expect.any(Function),
        persist: false,
      },
    };

    expect(result).toEqual(expected);
  });

  it('should handle cases with specific values for only failure or success options', () => {
    // Only the failure options with specific values
    const failureOnlyOptions = {
      failure: { persist: true },
    };
    const result1 = createToast(failureOnlyOptions);
    const expected1 = {
      failure: {
        invertVariant: false,
        message: expect.any(Function),
        persist: true,
      },
    };
    expect(result1).toEqual(expected1);

    // Only the success options with specific values
    const successOnlyOptions = {
      success: { invertVariant: true, persist: false },
    };
    const result2 = createToast(successOnlyOptions);
    const expected2 = {
      success: {
        invertVariant: true,
        message: expect.any(Function),
        persist: false,
      },
    };
    expect(result2).toEqual(expected2);
  });

  it('should handle case with both failure and success options with specific values', () => {
    const options = {
      failure: { invertVariant: true, persist: true },
      success: { invertVariant: true, persist: false },
    };
    const result = createToast(options);
    const expected = {
      failure: {
        invertVariant: true,
        message: expect.any(Function),
        persist: true,
      },
      success: {
        invertVariant: true,
        message: expect.any(Function),
        persist: false,
      },
    };

    expect(result).toEqual(expected);
  });
});
