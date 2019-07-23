import { GroupedEntitiesForImport } from 'src/store/selectors/getEntitiesWithGroupsToImport';

const shouldDisplayGroupImport = (
  groupedEntities: GroupedEntitiesForImport
) => {
  const { linodes, domains } = groupedEntities;
  return linodes.length > 0 || domains.length > 0;
};

export default shouldDisplayGroupImport;
