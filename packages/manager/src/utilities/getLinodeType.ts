const getType = <T extends any>(
  entities: T[],
  ids: string[],
  id: null | string
) => {
  if (id === null) {
    return null;
  }

  const foundIndex = ids.indexOf(id);
  return foundIndex > -1 ? entities[foundIndex] : undefined;
};

export default getType;
