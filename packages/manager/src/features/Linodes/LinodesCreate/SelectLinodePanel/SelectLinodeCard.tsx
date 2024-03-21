import { Linode } from '@linode/api-v4';
import React from 'react';

import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { useImageQuery } from 'src/queries/images';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { useTypeQuery } from 'src/queries/types';
import { formatStorageUnits } from 'src/utilities/formatStorageUnits';
import { isNotNullOrUndefined } from 'src/utilities/nullOrUndefined';

interface Props {
  disabled?: boolean;
  handleSelection: () => void;
  linode: Linode;
  selected?: boolean;
}

export const SelectLinodeCard = ({
  disabled,
  handleSelection,
  linode,
  selected,
}: Props) => {
  const { data: regions } = useRegionsQuery();

  const { data: linodeType } = useTypeQuery(
    linode?.type ?? '',
    Boolean(linode?.type)
  );

  const { data: linodeImage } = useImageQuery(
    linode?.image ?? '',
    Boolean(linode?.image)
  );

  const isLinodesGrantReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'linode',
    id: linode?.id,
  });

  const type = linodeType ? formatStorageUnits(linodeType?.label) : linode.type;
  const image = linodeImage?.label ?? linode.image;
  const region =
    regions?.find((region) => region.id == linode.region)?.label ??
    linode.region;

  return (
    <SelectionCard
      subheadings={[
        [type, image, region].filter(isNotNullOrUndefined).join(', '),
      ]}
      checked={selected}
      disabled={isLinodesGrantReadOnly || disabled}
      heading={linode.label}
      key={`selection-card-${linode.id}`}
      onClick={handleSelection}
    />
  );
};
