/* eslint-disable sonarjs/no-duplicate-string */
import {
  randomDomainName,
  randomIp,
  randomLabel,
  randomString,
} from 'support/util/random';

// Array of domain records for which to test creation.
export const createDomainRecords = () => [
  {
    fields: [
      {
        name: '[data-qa-target="Hostname"]',
        skipCheck: false,
        value: randomLabel(),
      },
      {
        name: '[data-qa-target="IP Address"]',
        skipCheck: false,
        value: randomIp(),
      },
    ],
    name: 'Add an A/AAAA Record',
    tableAriaLabel: 'List of Domains A/AAAA Record',
  },
  {
    fields: [
      {
        name: '[data-qa-target="Hostname"]',
        skipCheck: false,
        value: randomLabel(),
      },
      {
        name: '[data-qa-target="Alias to"]',
        skipCheck: false,
        value: `${randomLabel()}.net`,
      },
    ],
    name: 'Add a CNAME Record',
    tableAriaLabel: 'List of Domains CNAME Record',
  },
  {
    fields: [
      {
        name: '[data-qa-target="Hostname"]',
        skipCheck: false,
        value: randomLabel(),
      },
      {
        name: '[data-qa-target="Value"]',
        skipCheck: false,
        value: `${randomLabel()}=${randomString()}`,
      },
    ],
    name: 'Add a TXT Record',
    tableAriaLabel: 'List of Domains TXT Record',
  },
  {
    fields: [
      {
        name: '[data-qa-target="Service"]',
        skipCheck: true,
        value: randomLabel(),
      },
      {
        approximate: true,
        name: '[data-qa-target="Target"]',
        value: randomLabel(),
      },
    ],
    name: 'Add an SRV Record',
    tableAriaLabel: 'List of Domains SRV Record',
  },
  {
    fields: [
      {
        name: '[data-qa-target="Name"]',
        skipCheck: false,
        value: randomLabel(),
      },
      {
        name: '[data-qa-target="Value"]',
        skipCheck: false,
        value: randomDomainName(),
      },
    ],
    name: 'Add a CAA Record',
    tableAriaLabel: 'List of Domains CAA Record',
  },
];
