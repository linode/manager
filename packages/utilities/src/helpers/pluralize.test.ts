import { describe, expect, it } from 'vitest';

import { pluralize } from './pluralize';

describe('Pluralize helper function', () => {
  it('should pluralize when the number of items is greater than 1', () => {
    expect(pluralize('thing', 'things', 3)).toEqual('3 things');
  });

  it('should not pluralize when the number of items is 1', () => {
    expect(pluralize('bat', 'bats', 1)).toEqual('1 bat');
  });

  it('should pluralize 0 or below', () => {
    expect(pluralize('orangutan', 'orangutans', 0)).toEqual('0 orangutans');
    expect(pluralize('orangutan', 'orangutans', -4)).toEqual('-4 orangutans');
  });
});
