type JSONFieldToArray = [string, unknown];

const convertObjectToCLIArg = (data: {} | null) => {
  return `'${JSON.stringify(data).replace(':', ': ')}'`;
};

const parseObject = (key: string, value: {}) => {
  const result = Object.entries(value)
    .map(([_key, _value]) => {
      return `--${key}.${_key} ${JSON.stringify(_value)}`;
    })
    .join(' ');
  return result.padStart(result.length + 2);
};

const parseArray = (key: string, value: any[]) => {
  const results: string[] = [];
  if (key === 'interfaces') {
    results.push(
      value
        .map((item) => {
          return parseObject('interfaces', item);
        })
        .join('\\\n')
    );
  } else {
    value.forEach((item) => {
      results.push(`  --${key} ${item}`);
    });
  }
  return results.join(' \\\n');
};

const parseString = (key: string, value: string) => {
  const doesContainEscapableChars = value.match(/[^\w\s]/gi);
  let parsedValue = value;
  if (doesContainEscapableChars) {
    parsedValue = value.replace(/[^\w\s]/gi, function (char) {
      return '\\' + char;
    });
    parsedValue = `$'${parsedValue}'`;
  }
  return `  --${key} ${parsedValue}`;
};

const dataEntriesReduce = (acc: string[], [key, value]: JSONFieldToArray) => {
  if (value === undefined || value === null) {
    return acc;
  } else if (Array.isArray(value)) {
    if (value.length === 0) {
      return acc;
    }
    acc.push(parseArray(key, value));
    return acc;
  } else if (typeof value === 'object') {
    const valueAsString = convertObjectToCLIArg(value);
    acc.push(`  --${key} ${valueAsString}`);
  } else if (typeof value === 'string') {
    const parsedValue = parseString(key, value);
    acc.push(parsedValue);
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
