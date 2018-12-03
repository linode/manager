export const generateInFilter = (keyName: string, arr: any[]) => {
  return {
    '+or': arr.map(el => ({ [keyName]: el })),
  };
}

export const generatePollingFilter = (datestamp: string, pollIDsAsArr: string[]) => {
  return pollIDsAsArr.length ?
    {
      '+or': [
        { created: { '+gt': datestamp } },
        generateInFilter('id', pollIDsAsArr),
      ],
    }
    : {
      created: { '+gt': datestamp },
    };
}
