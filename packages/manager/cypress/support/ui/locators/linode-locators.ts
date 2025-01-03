export const emptyLinodePage = {
  resourcesContainer: 'div[data-qa-placeholder-container="resources-section"]',
  resourcesHeader1: 'h1[data-qa-header]',
  resourcesHeader2: 'h2',
  createLinodeButton: 'Create Linode',
};

export const nonEmptyLinodePage = {
  linodesLabel: 'h1[data-qa-header="Linodes"]',
  docsLink: 'a[aria-label="Docs - link opens in a new tab"]',
  createLinodeButton: 'Create Linode',
  listOfLinodesTable: 'table[aria-label="List of Linodes"]',
  downloadCsvButton: 'span[data-testid="loadingIcon"]',
};

export const listOfLinodesTableHeader = {
  ipv4SortButton: '[aria-label="Sort by ipv4[0]',
  labelSortButton: '[aria-label="Sort by label"]',
  regionSortButton: '[aria-label="Sort by region"]',
  statusPrioritySortButton: '[aria-label="Sort by _statusPriority"]',
  typeSortButton: '[aria-label="Sort by type"]',
  toggleGroupByTagButton: '[aria-label="Toggle group by tag"]',
  toggleDisplayButton: '[aria-label="Toggle display"]',
};

export const listOfLinodesTableBody = {
  linodeActionMenu: (label: string) =>
    `[aria-label="Action menu for Linode ${label}"]`,
  linodeActionMenuButton: (label: string) => `Action menu for Linode ${label}`,
  ipClipboardCopyButton: (ip: string) =>
    `[aria-label="Copy ${ip} to clipboard"]`,
  rowByLabel: (label: string) => `tr[data-qa-linode="${label}"]`,
  rows: 'table[aria-label="List of Linodes"] tbody tr',
};

export const listOfLinodesTableTagsBody = {
  evenTag: '[data-qa-tag-header="even"]',
  oddTag: '[data-qa-tag-header="odd"]',
  numTag: '[data-qa-tag-header="nums"]',
};

export const summaryViewLinodeDetails = {
  linodesConatiner: '[data-qa-linode-card]',
  summaryLabel: 'Summary',
  publicIpAddresLabel: 'Public IP Addresses',
  accessLabel: 'Access',
  planLabel: 'Plan:',
  regionLabel: 'Region:',
  linodeIdLabel: 'Linode ID:',
  createdLabel: 'Created:',
};

export const errorMessage = {
  restrictedUserTooltip:
    "You don't have permissions to create Linodes. Please contact your account administrator to request the necessary permissions.",
};
