import { compose, find, lensPath, prop, propEq, set } from 'ramda';
import { displayType } from 'src/features/linodes/presentation';
import { ExtendedType } from './SelectPlanPanel';
import { ExtendedLinode } from './types';

export const extendLinodes = (
  linodes: Linode.Linode[],
  imagesData?: Linode.Image[],
  typesData?: ExtendedType[]
): ExtendedLinode[] => {
  const images = imagesData || [];
  const types = typesData || [];
  return linodes.map(
    linode =>
      compose<Linode.Linode, Partial<ExtendedLinode>, Partial<ExtendedLinode>>(
        set(lensPath(['heading']), linode.label),
        set(
          lensPath(['subHeadings']),
          formatLinodeSubheading(
            displayType(linode.type, types),
            compose<Linode.Image[], Linode.Image, string>(
              prop('label'),
              find(propEq('id', linode.image))
            )(images)
          )
        )
      )(linode) as ExtendedLinode
  );
};

const formatLinodeSubheading = (typeInfo: string, imageInfo: string) => {
  const subheading = imageInfo ? `${typeInfo}, ${imageInfo}` : `${typeInfo}`;
  return [subheading];
};
