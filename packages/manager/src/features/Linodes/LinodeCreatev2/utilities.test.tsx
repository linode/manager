import { createLinodeRequestFactory } from 'src/factories';

import { base64UserData, userData } from '../LinodesCreate/utilities.test';
import { getLinodeCreatePayload, getTabIndex } from './utilities';

describe('getTabIndex', () => {
  it('should return 0 when there is no value specifying the tab', () => {
    expect(getTabIndex(undefined)).toBe(0);
  });
  it('should return 0 when the value is not a valid tab', () => {
    // @ts-expect-error We are intentionally passing an invalid value.
    expect(getTabIndex('fake tab')).toBe(0);
  });
  it('should return the correct index when the value is a valid tab', () => {
    expect(getTabIndex('Images')).toBe(3);
  });
});

describe('getLinodeCreatePayload', () => {
  it('should return a basic payload', () => {
    const values = createLinodeRequestFactory.build();

    expect(getLinodeCreatePayload(values)).toStrictEqual(values);
  });

  it('should base64 encode metadata', () => {
    const values = createLinodeRequestFactory.build({
      metadata: { user_data: userData },
    });

    expect(getLinodeCreatePayload(values)).toStrictEqual({
      ...values,
      metadata: { user_data: base64UserData },
    });
  });
});
