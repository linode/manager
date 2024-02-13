import { determineNoneSingleOrMultipleWithChip } from './noneSingleOrMultipleWithChip';

describe('determineNoneSingleOrMultipleWithChip', () => {
  it('should return None for empty arrays', () => {
    expect(determineNoneSingleOrMultipleWithChip([])).toEqual('None');
  });

  it('should return the element if the array only consists of one element', () => {
    const array = ['Test'];

    expect(determineNoneSingleOrMultipleWithChip(array)).toEqual(array[0]);
  });

  it('should not return "None" nor equal the first element of the array if the array contains multiple elements', () => {
    const array = ['Test', 'Test 2', 'Test 3', 'Test 4'];

    const returned = determineNoneSingleOrMultipleWithChip(array);

    expect(returned).not.toEqual('None');
    expect(returned).not.toEqual('Test');
  });
});
