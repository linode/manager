export const selectiveCopyObject = <T>(
  keysToIgnore: string[],
  objToCopy: T
) => {
  return Object.keys(objToCopy).reduce((acc, thisKey) => {
    if (!keysToIgnore.includes(thisKey)) {
      const thisField = objToCopy[thisKey];
      if (typeof thisField === 'object' && !Array.isArray(thisField)) {
        // recurse
        acc[thisKey] = selectiveCopyObject(keysToIgnore, { ...thisField });
      } else {
        // just copy the field
        acc[thisKey] = objToCopy[thisKey];
      }
    }
    return { ...acc };
  }, {} as T);
};
