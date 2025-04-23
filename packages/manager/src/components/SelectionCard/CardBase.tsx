import * as React from 'react';

import { useFlags } from 'src/hooks/useFlags';

import {
  CardBaseGrid,
  CardBaseHeading,
  CardBaseHeadings,
  CardBaseIcon,
  CardBaseSubheading,
} from './CardBase.styles';

import type { SxProps, Theme } from '@mui/material/styles';

export interface CardBaseProps {
  checked?: boolean;
  heading: JSX.Element | string;
  headingDecoration?: JSX.Element;
  renderIcon?: () => JSX.Element;
  renderVariant?: () => JSX.Element | null;
  subheadings: (JSX.Element | string | undefined)[];
  sx?: SxProps<Theme>;
  sxHeading?: SxProps<Theme>;
  sxIcon?: SxProps<Theme>;
  sxSubheading?: SxProps<Theme>;
}
export const CardBase = (props: CardBaseProps) => {
  const {
    checked,
    heading,
    headingDecoration,
    renderIcon,
    renderVariant,
    subheadings,
    sx,
    sxHeading,
    sxIcon,
    sxSubheading,
  } = props;

  const flags = useFlags();

  const isDatabaseCreateFlow = location.pathname.includes('/databases/create');
  const isDatabaseResizeFlow =
    location.pathname.match(/\/databases\/.*\/(\d+\/resize)/)?.[0] ===
    location.pathname;

  const isDatabaseGA =
    !flags.dbaasV2?.beta &&
    flags.dbaasV2?.enabled &&
    (isDatabaseCreateFlow || isDatabaseResizeFlow);

  const renderSubheadings = subheadings.map((subheading, idx) => {
    const subHeadingIsString = typeof subheading === 'string';

    return (
      <CardBaseSubheading
        checked={checked}
        className={subHeadingIsString ? 'cardSubheadingItem' : ''}
        data-qa-select-card-subheading={`subheading-${idx + 1}`}
        key={idx}
        sx={sxSubheading}
      >
        {subHeadingIsString && isDatabaseGA
          ? subheading?.replace('Storage', 'Usable Storage')
          : subheading}
      </CardBaseSubheading>
    );
  });

  return (
    <CardBaseGrid checked={checked} container spacing={2} sx={sx}>
      {renderIcon && <CardBaseIcon sx={sxIcon}>{renderIcon()}</CardBaseIcon>}
      <CardBaseHeadings sx={sxHeading}>
        <CardBaseHeading
          className="cardSubheadingTitle"
          data-qa-select-card-heading={heading}
        >
          {heading}
          {headingDecoration}
        </CardBaseHeading>
        {renderSubheadings}
      </CardBaseHeadings>
      {renderVariant ? renderVariant() : null}
    </CardBaseGrid>
  );
};
