import { GrantLevel } from '@linode/api-v4/lib/account';
import { Config, Disk } from '@linode/api-v4/lib/linodes';
import { useSelector } from 'react-redux';
import { useGrants } from 'src/queries/profile';
import { useSpecificTypes } from 'src/queries/types';
import { ApplicationState } from 'src/store';
import { getLinodeConfigsForLinode } from 'src/store/linodes/config/config.selectors';
import { getLinodeDisksForLinode } from 'src/store/linodes/disk/disk.selectors';
import { LinodeWithMaintenance } from 'src/store/linodes/linodes.helpers';
import { getPermissionsForLinode } from 'src/store/linodes/permissions/permissions.selector';
import { ExtendedType, extendTypesQueryResult } from 'src/utilities/extendType';
import { isNotNullOrUndefined } from 'src/utilities/nullOrUndefined';
import useLinodes from './useLinodes';

export interface ExtendedLinode extends LinodeWithMaintenance {
  _configs: Config[];
  _disks: Disk[];
  _type?: null | ExtendedType;
  _permissions: GrantLevel;
}

export const useExtendedLinodes = (linodeIds?: number[]): ExtendedLinode[] => {
  const { data: grants } = useGrants();
  const { linodes: linodesMap } = useLinodes();
  const linodes = (linodeIds ?? Object.keys(linodesMap.itemsById))
    .map((linodeId) => linodesMap.itemsById[linodeId])
    .filter(isNotNullOrUndefined);
  const typesQuery = useSpecificTypes(
    linodes.map((linode) => linode.type).filter(isNotNullOrUndefined)
  );
  const types = extendTypesQueryResult(typesQuery);

  const typeMap = new Map<string, ExtendedType>(
    types.map((type) => [type.id, type])
  );

  return useSelector((state: ApplicationState) => {
    const { __resources } = state;
    const { linodeConfigs, linodeDisks } = __resources;

    return linodes.map((linode) => ({
      ...linode,
      _type: linode.type ? typeMap.get(linode.type) : null,
      _configs: getLinodeConfigsForLinode(linodeConfigs, linode.id),
      _disks: getLinodeDisksForLinode(linodeDisks, linode.id),
      _permissions: getPermissionsForLinode(grants ?? null, linode.id),
    }));
  });
};

export const useExtendedLinode = (linodeId: number): ExtendedLinode | null =>
  useExtendedLinodes([linodeId])[0] ?? null;

export default useExtendedLinode;
