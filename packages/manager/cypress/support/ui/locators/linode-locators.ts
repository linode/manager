// This file contains locators for the Linode page in the Manager.

// Empty Linode landing page
export const emptyLinodePage = {
  // Resources section
  resourcesContainer: 'div[data-qa-placeholder-container="resources-section"]',
  // Resources header
  resourcesHeader1: 'h1[data-qa-header]',
};

// Non-empty Linode landing page
export const nonEmptyLinodePage = {
  // Docs link
  docsLink: 'a[aria-label="Docs - link opens in a new tab"]',
  // Download CSV button
  downloadCsvButton: 'span[data-testid="loadingIcon"]',
  // Linode label header
  linodesLabel: 'h1[data-qa-header="Linodes"]',
  // Linode table
  listOfLinodesTable: 'table[aria-label="List of Linodes"]',
};

// Linode table header
export const listOfLinodesTableHeader = {
  // ip sort button
  ipv4SortButton: '[aria-label="Sort by ipv4[0]',
  // label sort button
  labelSortButton: '[aria-label="Sort by label"]',
  // region sort button
  regionSortButton: '[aria-label="Sort by region"]',
  // status sort button
  statusPrioritySortButton: '[aria-label="Sort by _statusPriority"]',
  // toggle display button
  toggleDisplayButton: '[aria-label="Toggle display"]',
  // toggle group by tag button
  toggleGroupByTagButton: '[aria-label="Toggle group by tag"]',
  // type sort button
  typeSortButton: '[aria-label="Sort by type"]',
};

// Linode table body
export const listOfLinodesTableBody = {
  // ip copy button which takes ip as a parameter
  ipClipboardCopyButton: (ip: string) =>
    `[aria-label="Copy ${ip} to clipboard"]`,
  // linode action menu which takes label as a parameter
  linodeActionMenu: (label: string) =>
    `[aria-label="Action menu for Linode ${label}"]`,
  // linode label which takes label as a parameter
  rowByLabel: (label: string) => `tr[data-qa-linode="${label}"]`,
  // linode table row
  rows: 'table[aria-label="List of Linodes"] tbody tr',
};

// Linode table tags
export const listOfLinodesTableTagsBody = {
  // even tag
  evenTag: '[data-qa-tag-header="even"]',
  // num tag
  numTag: '[data-qa-tag-header="nums"]',
  // odd tag
  oddTag: '[data-qa-tag-header="odd"]',
};
