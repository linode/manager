export const getTypeInfo = (
  type: string | null,
  types: Linode.LinodeType[]
) => {
  return types.find((thisType: Linode.LinodeType) => {
    return type === thisType.id;
  });
};
