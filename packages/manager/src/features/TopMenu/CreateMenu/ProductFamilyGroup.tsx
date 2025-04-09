import { Stack } from '@linode/ui';
import { Typography } from '@linode/ui';
import * as React from 'react';
import { Link } from 'react-router-dom';

import {
  StyledHeading,
  StyledLinkTypography,
  StyledMenuItem,
} from './CreateMenu.styles';

import type { CreateMenuLink } from './CreateMenu';
import type { ProductFamilyLinkGroup } from 'src/components/PrimaryNav/PrimaryNav';

interface ProductFamilyGroupProps {
  handleClose: () => void;
  productFamily: ProductFamilyLinkGroup<CreateMenuLink[]>;
}

export const ProductFamilyGroup = (props: ProductFamilyGroupProps) => {
  const { handleClose, productFamily } = props;
  const filteredLinks = productFamily.links.filter((link) => !link.hide);
  if (filteredLinks.length === 0) {
    return null;
  }

  return (
    <>
      <StyledHeading paddingTop={productFamily.name === 'Databases'}>
        {productFamily.icon}
        {productFamily.name}
      </StyledHeading>
      {filteredLinks.map(
        (link) =>
          !link.hide && [
            <StyledMenuItem
              component={Link}
              key={link.display}
              onClick={handleClose}
              tabIndex={0}
              to={link.href}
              {...link.attr}
            >
              <Stack>
                <StyledLinkTypography>{link.display}</StyledLinkTypography>
                <Typography>{link.description}</Typography>
              </Stack>
            </StyledMenuItem>,
          ]
      )}
    </>
  );
};
