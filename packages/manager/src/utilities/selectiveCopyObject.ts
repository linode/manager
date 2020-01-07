export const selectiveCopyObject = <T>(keys: string[], objToCopy: T) => {
  return Object.keys(objToCopy).reduce((acc, thisKey) => {
    if (keys.includes(thisKey)) {
      const thisField = objToCopy[thisKey];
      if (typeof thisField === 'object') {
        // recurse
        acc[thisKey] = selectiveCopyObject(keys, { ...thisField });
      } else {
        // just copy the field
        acc[thisKey] = objToCopy[thisKey];
      }
    }
    return acc;
  }, {} as T);
};
