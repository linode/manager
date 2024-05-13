import {
  randomLabel,
  randomIp,
  randomString,
  randomDomainName,
} from 'support/util/random';

// Array of domain records for which to test creation.
export const createDomainRecords = () => [
  {
    name: 'Add an A/AAAA Record',
    tableAriaLabel: 'List of Domains A/AAAA Record',
    fields: [
      {
        name: '[data-qa-target="Hostname"]',
        value: randomLabel(),
        skipCheck: false,
      },
      {
        name: '[data-qa-target="IP Address"]',
        value: `${randomIp()}`,
        skipCheck: false,
      },
    ],
  },
  {
    name: 'Add a CNAME Record',
    tableAriaLabel: 'List of Domains CNAME Record',
    fields: [
      {
        name: '[data-qa-target="Hostname"]',
        value: randomLabel(),
        skipCheck: false,
      },
      {
        name: '[data-qa-target="Alias to"]',
        value: `${randomLabel()}.net`,
        skipCheck: false,
      },
    ],
  },
  {
    name: 'Add a TXT Record',
    tableAriaLabel: 'List of Domains TXT Record',
    fields: [
      {
        name: '[data-qa-target="Hostname"]',
        value: randomLabel(),
        skipCheck: false,
      },
      {
        name: '[data-qa-target="Value"]',
        value: `${randomLabel()}=${randomString()}`,
        skipCheck: false,
      },
    ],
  },
  {
    name: 'Add an SRV Record',
    tableAriaLabel: 'List of Domains SRV Record',
    fields: [
      {
        name: '[data-qa-target="Service"]',
        value: randomLabel(),
        skipCheck: true,
      },
      {
        name: '[data-qa-target="Target"]',
        value: randomLabel(),
        approximate: true,
      },
    ],
  },
  {
    name: 'Add a CAA Record',
    tableAriaLabel: 'List of Domains CAA Record',
    fields: [
      {
        name: '[data-qa-target="Name"]',
        value: randomLabel(),
        skipCheck: false,
      },
      {
        name: '[data-qa-target="Value"]',
        value: randomDomainName(),
        skipCheck: false,
      },
    ],
  },
];
