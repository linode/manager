import { createSelector } from 'reselect';

export interface GroupedEntitiesForImport {
  linodes: GroupImportProps[];
  // @todo: Uncomment when domain support is added
  // domains: GroupImportProps[];
}
export interface GroupImportProps {
  id: number;
  group?: string;
  tags: string[];
}

// Linodes and Domains are the only entities with Display Groups.
type GroupedEntity = Linode.Linode | Linode.Domain;

// Returns TRUE if "group" is NOT in "tags".
export const uniqueGroup = (entity: GroupedEntity) => entity.group && !entity.tags.includes(entity.group);

// We're only interested in a subset of an entities properties for group import,
// so we extract them.
export const extractProps = (entity: GroupedEntity) => ({
  id: entity.id,
  group: entity.group,
  tags: entity.tags
});


const linodeSelector = (state: ApplicationState) => state.__resources.linodes.entities;

// @todo: Uncomment when domain support is added
// const domainSelector = (state: ApplicationState) => state.__resources.domains.entities

// Selector that returns Linodes and Domains that have a GROUP without
// corresponding TAG.
export const entitiesWithGroupsToImport =
  createSelector<ApplicationState, Linode.Linode[], GroupedEntitiesForImport>(
    linodeSelector,
    (linodes) => {
      return {
        linodes: linodes.filter(uniqueGroup).map(extractProps),
        // @todo: Uncomment when domain support is added
        // domains: domains.filter(tagsIncludeGroup).map(extractProps)
      }
    }
  );

// @todo: Use this version of the selector when domain support is added
// export const entitiesWithGroupsToImport =
//   createSelector<ApplicationState, Linode.Linode[], Linode.Domain[], GroupedEntitiesForImport>(
//     linodeSelector, domainSelector,
//     (linodes, domains) => {
//       return {
//         linodes: linodes.filter(tagsIncludeGroup).map(extractProps),
//         // @todo: Uncomment when domain support is added
//         // domains: domains.filter(tagsIncludeGroup).map(extractProps)
//       }
//     }
//   );

export default entitiesWithGroupsToImport;