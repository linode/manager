import { UserData } from '@linode/api-v4/lib/linodes/types';

// Credit: https://github.com/xxorax/node-shell-escape
function escapeStringForCLI(s: string): string {
  if (/[^A-Za-z0-9_\/:=-]/.test(s)) {
    s = "'" + s.replace(/'/g, "'\\''") + "'";
    s = s
      .replace(/^(?:'')+/g, '') // unduplicate single-quote at the beginning
      .replace(/\\'''/g, "\\'"); // remove non-escaped single-quote if there are enclosed between 2 escaped
  }
  return s;
}

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
      results.push(`  --${key} ${escapeStringForCLI(item)}`);
    });
  }
  return results.join(' \\\n');
};

const parseString = (key: string, value: string) => {
  const parsedValue = escapeStringForCLI(value);
  return `  --${key} ${parsedValue}`;
};

const dataEntriesReduce = (acc: string[], [key, value]: JSONFieldToArray) => {
  if (value === undefined || value === null) {
    return acc;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return acc;
    }
    acc.push(parseArray(key, value));
    return acc;
  }

  if (key === 'metadata') {
    const userData = value as UserData;
    acc.push(`  --${key}.user_data="${userData.user_data}"`);
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
