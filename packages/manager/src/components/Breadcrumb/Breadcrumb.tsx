import * as React from 'react';

import { StyledPreContainerDiv, StyledRootDiv } from './Breadcrumb.styles';
import { CrumbOverridesProps, Crumbs } from './Crumbs';
import { EditableProps, LabelProps } from './types';

export interface BreadcrumbProps {
  /**
   * Data attributes passed to the root div for testing.
   */
  breadcrumbDataAttrs?: { [key: string]: boolean };
  /**
   * An array of objects that can be used to customize any crumb.
   */
  crumbOverrides?: CrumbOverridesProps[];
  /**
   * A boolean that if true will only show the first and last crumb.
   */
  firstAndLastOnly?: boolean;
  /**
   * An object that can be used to configure the final crumb.
   */
  labelOptions?: LabelProps;
  /**
   * A string that can be used to set a custom title for the last crumb.
   */
  labelTitle?: string;
  /**
   * An object that can be used to define functions, errors, and crumb title for an editable final crumb.
   */
  onEditHandlers?: EditableProps;
  /*
   * A string representation of the path of a resource. Each crumb is separated by a `/` character.
   */
  pathname: string;
  /**
   * A number indicating the position of the crumb to remove. Not zero indexed.
   */
  removeCrumbX?: number;
}

/**
 * ## Usage
 * - Include the current page as the last item in the breadcrumb trail.
 * - In the breadcrumb trail, the breadcrumb corresponding the the current page should not be a link.
 */
export const Breadcrumb = (props: BreadcrumbProps) => {
  const {
    breadcrumbDataAttrs,
    crumbOverrides,
    firstAndLastOnly,
    labelOptions,
    labelTitle,
    onEditHandlers,
    pathname,
    removeCrumbX,
  } = props;

  const url = pathname && pathname.slice(1);
  const allPaths = url.split('/');

  const pathMap = removeCrumbX
    ? removeByIndex(allPaths, removeCrumbX - 1)
    : allPaths;

  const hasError = Boolean(onEditHandlers?.errorText);

  return (
    <StyledRootDiv
      sx={{ ...(hasError && { marginBottom: (theme) => theme.spacing(3) }) }}
      {...breadcrumbDataAttrs}
    >
      <StyledPreContainerDiv
        sx={{ ...(onEditHandlers !== undefined && { alignItems: 'center' }) }}
      >
        <Crumbs
          crumbOverrides={crumbOverrides}
          firstAndLastOnly={firstAndLastOnly}
          labelOptions={labelOptions}
          labelTitle={labelTitle}
          onEditHandlers={onEditHandlers}
          pathMap={pathMap}
        />
      </StyledPreContainerDiv>
    </StyledRootDiv>
  );
};

const removeByIndex = (list: string[], indexToRemove: number) => {
  return list.filter((value, index) => {
    return index !== indexToRemove;
  });
};
