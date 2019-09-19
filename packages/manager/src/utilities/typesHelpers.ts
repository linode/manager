import { LinodeType } from 'linode-js-sdk/lib/linodes';

export const getTypeInfo = (type: string | null, types: LinodeType[]) => {
  return types.find((thisType: LinodeType) => {
    return type === thisType.id;
  });
};
