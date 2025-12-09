import type { grantTypeMap } from 'src/features/Account/constants';

// A useful type for getting the values of an object
export type ObjectValues<T> = T[keyof T];

export type GrantTypeMap = ObjectValues<typeof grantTypeMap>;
