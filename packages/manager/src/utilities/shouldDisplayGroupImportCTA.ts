import { GroupedEntitiesForImport } from 'src/store/selectors/getEntitiesWithGroupsToImport';

const shouldDisplayGroupImport = (
  groupedEntities: GroupedEntitiesForImport
) => {
  const { linodes } = groupedEntities;
  return linodes.length > 0;
};

export default shouldDisplayGroupImport;
