import * as React from 'react';

import {
  CardBaseGrid,
  CardBaseHeading,
  CardBaseHeadings,
  CardBaseIcon,
  CardBaseSubheading,
} from './CardBase.styles';

import type { SxProps } from '@mui/system';

export interface CardBaseProps {
  checked?: boolean;
  heading: JSX.Element | string;
  headingDecoration?: JSX.Element;
  renderIcon?: () => JSX.Element;
  renderVariant?: () => JSX.Element | null;
  subheadings: (JSX.Element | string | undefined)[];
  sx?: SxProps;
  sxHeading?: SxProps;
  sxIcon?: SxProps;
  sxSubheading?: SxProps;
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

  const renderSubheadings = subheadings.map((subheading, idx) => {
    const subHeadingIsString = typeof subheading === 'string';

    return (
      <CardBaseSubheading
        className={subHeadingIsString ? 'cardSubheadingItem' : ''}
        data-qa-select-card-subheading={`subheading-${idx + 1}`}
        key={idx}
        sx={sxSubheading}
      >
        {subheading}
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
