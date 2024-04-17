import { snakeCase } from './snakeCase';

describe('snakeCase utility', () => {
  it('should convert camelCase to snake_case', () => {
    expect(snakeCase('camelCaseString')).toBe('camel_case_string');
    expect(snakeCase('camelCaseStringWithWordsAndNumbers123')).toBe(
      'camel_case_string_with_words_and_numbers123'
    );
    expect(
      snakeCase('camelCaseStringWithWordsAndNumbers123AndSymbols!@#$')
    ).toBe('camel_case_string_with_words_and_numbers123_and_symbols_');
    expect(snakeCase('string with spaces')).toBe('string_with_spaces');
  });
});
