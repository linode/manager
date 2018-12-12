import { createSelector } from 'reselect';

export interface GroupedEntitiesForImport {
  linodes: GroupImportProps[];
  // @todo: Uncomment when domain support is added
  // domains: GroupImportProps[];
}

interface GroupImportProps {
  id: number;
  group?: string;
  tags: string[];
}

type GroupedEntity = Linode.Linode | Linode.Domain;

export const tagsIncludeGroup = (entity: GroupedEntity) => entity.group && !entity.tags.includes(entity.group || '');

export const extractProps = (entity: GroupedEntity) => ({
  id: entity.id,
  group: entity.group,
  tags: entity.tags
});

// @todo Type correctly as ApplicationState when rebased
const linodeSelector = (state: any) => state.__resources.linodes.entities;

// @todo: Uncomment when domain support is added
// const domainSelector = (state: ApplicationState) => state.__resources.domains.entities

export const entitiesWithGroupsToImport =
  createSelector<ApplicationState, Linode.Linode[], GroupedEntitiesForImport>(
    linodeSelector,
    (linodes) => {
      return {
        linodes: linodes.filter(tagsIncludeGroup).map(extractProps),
        // @todo: Uncomment when domain support is added
        // domains: domains.filter(tagsIncludeGroup).map(extractProps)
      }
    }
  );

// @todo: Use this version when domain support is added
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