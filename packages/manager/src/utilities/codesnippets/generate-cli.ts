import type { PlacementGroup } from '@linode/api-v4';
import type {
  ConfigInterfaceIPv4,
  UserData,
} from '@linode/api-v4/lib/linodes/types';

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
  // M3-7638: The Linode CLI does not currently accept interfaces.ipv4 as an object so we need to make them separate arguments
  const parseIpv4Object = (_key: string, _value: ConfigInterfaceIPv4) => {
    const ipv4ValueStrings = [];
    if (_value.nat_1_1) {
      ipv4ValueStrings.push(
        `--${key}.${_key}.nat_1_1 ${JSON.stringify(_value.nat_1_1)}`
      );
    }
    if (_value.vpc) {
      ipv4ValueStrings.push(
        `--${key}.${_key}.vpc ${JSON.stringify(_value.vpc)}`
      );
    }
    return ipv4ValueStrings.join(' ');
  };

  const result = Object.entries(value)
    .map(([_key, _value]) => {
      if (_key === 'ipv4') {
        return parseIpv4Object(_key, _value as ConfigInterfaceIPv4);
      }
      return `--${key}.${_key} ${JSON.stringify(_value)}`;
    })
    .filter((string) => string.length > 0)
    .join(' ');
  return result.padStart(result.length + 2);
};

const parseArray = (key: string, value: any[]) => {
  const results: string[] = [];
  if (key === 'interfaces') {
    results.push(
      value
        .map((item) => {
          // M3-7638: vpc_id is not a valid argument. The subnet_id will be used in the backend to implicitly determine the VPC ID
          delete item.vpc_id;
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
  } else if (key === 'placement_group') {
    const placementGroup = value as PlacementGroup;
    acc.push(`  --${key}.id ${placementGroup.id}`);
    {
      /* TODO VM_Placement: Add logic to include the `compliant_only` argument */
    }
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

export const generateCLICommand = (
  data: {},
  sourceLinodeID?: number,
  linodeCLIAction?: string
) => {
  const dataForCLI = Object.entries(data).reduce(dataEntriesReduce, []);

  if (linodeCLIAction === 'Clone Linode') {
    return `linode-cli linodes clone ${sourceLinodeID} \\\n${dataForCLI.join(
      ' \\\n'
    )}`;
  }

  return `linode-cli linodes create \\\n${dataForCLI.join(' \\\n')}`;
};
