import { Domain } from 'linode-js-sdk/lib/domains';
import { Linode } from 'linode-js-sdk/lib/linodes';
import { lensPath, view } from 'ramda';
import { createSelector } from 'reselect';
import { ApplicationState } from 'src/store';

export interface GroupedEntitiesForImport {
  linodes: GroupImportProps[];
  domains: GroupImportProps[];
}
export interface GroupImportProps {
  id: number;
  group?: string;
  label: string;
  tags: string[];
}

// Linodes and Domains are the only entities with Display Groups.
type GroupedEntity = Linode | Domain;

// Returns TRUE if "group" is NOT in "tags". (CASE IGNORED)
export const uniqueGroup = (entity: GroupedEntity) => {
  if (!entity.group) {
    return false;
  }

  const lowercaseGroup = entity.group.toLowerCase();
  const lowercaseTags = entity.tags.map(tag => tag.toLowerCase());

  return !lowercaseTags.includes(lowercaseGroup);
};

const L = {
  label: lensPath(['label']),
  domain: lensPath(['domain'])
};
// We're only interested in a subset of an entities properties for group import,
// so we extract them.
export const extractProps = (entity: GroupedEntity) => ({
  // As always, Domains don't have labels.
  label:
    view<GroupedEntity, string>(L.label, entity) ||
    view<GroupedEntity, string>(L.domain, entity),
  id: entity.id,
  group: entity.group,
  tags: entity.tags
});

const linodeSelector = (state: ApplicationState) =>
  Object.values(state.__resources.linodes.itemsById);
const domainSelector = (state: ApplicationState) =>
  Object.values(state.__resources.domains.itemsById) || [];

// Selector that returns Linodes and Domains that have a GROUP without
// corresponding TAG.
export const entitiesWithGroupsToImport = createSelector<
  ApplicationState,
  Linode[],
  Domain[],
  GroupedEntitiesForImport
>(linodeSelector, domainSelector, (linodes, domains) => {
  return {
    linodes: linodes.filter(uniqueGroup).map(extractProps),
    domains: domains.filter(uniqueGroup).map(extractProps)
  };
});

export default entitiesWithGroupsToImport;
