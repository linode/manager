type JSONFieldToArray = [string, unknown];

const convertObjectToCLIArg = (data: {} | null) => {
  return `'${JSON.stringify(data).replace(':', ': ')}'`;
};

const dataEntriesReduce = (acc: string[], [key, value]: JSONFieldToArray) => {
  if (value === undefined || value === null) {
    return acc;
  } else if (Array.isArray(value) && value.length === 0) {
    return acc;
  } else if (typeof value === 'object') {
    const valueAsString = convertObjectToCLIArg(value);
    acc.push(`  --${key} ${valueAsString}`);
  } else {
    acc.push(`  --${key} ${value}`);
  }
  return acc;
};

export const generateCLICommand = (data: {}) => {
  const dataForCLI = Object.entries(data).reduce(dataEntriesReduce, []);
  return `linode-cli linodes create \\\n${dataForCLI.join(' \\\n')}`;
};

export default generateCLICommand;
