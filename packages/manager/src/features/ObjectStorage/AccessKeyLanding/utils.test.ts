import { ObjectStorageKey } from '@linode/api-v4/lib/object-storage';

import { FormState } from './OMC_AccessKeyDrawer';
import { generateUpdatePayload, hasLabelOrRegionsChanged } from './utils';

describe('generateUpdatePayload', () => {
  const initialValues: FormState = {
    bucket_access: [],
    label: 'initialLabel',
    regions: ['region1', 'region2'],
  };

  test('should return empty object if no changes', () => {
    const updatedValues = { ...initialValues };
    expect(generateUpdatePayload(updatedValues, initialValues)).toEqual({});
  });

  test('should return updated label if only label changed', () => {
    const updatedValues = { ...initialValues, label: 'newLabel' };
    expect(generateUpdatePayload(updatedValues, initialValues)).toEqual({
      label: 'newLabel',
    });
  });

  test('should return updated regions if only regions changed', () => {
    const updatedValues = { ...initialValues, regions: ['region3', 'region4'] };
    expect(generateUpdatePayload(updatedValues, initialValues)).toEqual({
      regions: ['region3', 'region4'],
    });
  });

  test('should return updated label and regions if both changed', () => {
    const updatedValues = {
      bucket_access: [],
      label: 'newLabel',
      regions: ['region3', 'region4'],
    };
    expect(generateUpdatePayload(updatedValues, initialValues)).toEqual({
      label: 'newLabel',
      regions: ['region3', 'region4'],
    });
  });
});

describe('hasLabelOrRegionsChanged', () => {
  const updatedValues: FormState = {
    bucket_access: [],
    label: 'initialLabel',
    regions: ['region3', 'region4'],
  };
  const initialValues: ObjectStorageKey = {
    access_key: '',
    bucket_access: null,
    id: 0,
    label: updatedValues.label,
    limited: false,
    regions: [
      { id: 'region3', s3_endpoint: '' },
      { id: 'region4', s3_endpoint: '' },
    ],

    secret_key: '',
  };

  test('returns false when both label and regions are unchanged', () => {
    expect(hasLabelOrRegionsChanged(updatedValues, initialValues)).toBe(false);
  });

  test('returns true when only the label has changed', () => {
    expect(
      hasLabelOrRegionsChanged(
        { ...updatedValues, label: 'newLabel' },
        initialValues
      )
    ).toBe(true);
  });

  test('returns true when only the regions have changed', () => {
    expect(
      hasLabelOrRegionsChanged(
        {
          ...updatedValues,
          regions: ['region5'],
        },
        initialValues
      )
    ).toBe(true);
  });

  test('returns true when both label and regions have changed', () => {
    expect(
      hasLabelOrRegionsChanged(
        { ...updatedValues, label: 'newLabel', regions: ['region5'] },
        initialValues
      )
    ).toBe(true);
  });
});
