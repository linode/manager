import * as React from 'react';
// eslint-disable-next-line no-restricted-imports
import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';

import {
  StyledDiv,
  StyledSlashTypography,
  StyledTypography,
} from './Crumbs.styles';
import { FinalCrumb } from './FinalCrumb';
import { FinalCrumbPrefix } from './FinalCrumbPrefix';

import type { EditableProps, LabelProps } from './types';

export interface CrumbOverridesProps {
  label?: React.ReactNode | string;
  linkTo?: LinkProps['to'];
  noCap?: boolean;
  position: number;
}

interface Props {
  crumbOverrides?: CrumbOverridesProps[];
  disabledBreadcrumbEditButton?: boolean;
  firstAndLastOnly?: boolean;
  labelOptions?: LabelProps;
  labelTitle?: string;
  onEditHandlers?: EditableProps;
  pathMap: string[];
}

export const Crumbs = React.memo((props: Props) => {
  const {
    crumbOverrides,
    disabledBreadcrumbEditButton,
    firstAndLastOnly,
    labelOptions,
    labelTitle,
    onEditHandlers,
    pathMap,
  } = props;

  const allCrumbsButLast = pathMap.slice(0, -1);
  const firstCrumb = [pathMap[0]];
  const lastCrumb = pathMap.slice(-1)[0];
  const finalCrumbs =
    firstAndLastOnly && pathMap.length > 1 ? firstCrumb : allCrumbsButLast;

  return (
    <>
      {finalCrumbs.map((crumb: string, key: number) => {
        const link =
          '/' + pathMap.slice(0, -(pathMap.length - (key + 1))).join('/');
        const override =
          crumbOverrides && crumbOverrides.find((e) => e.position === key + 1);

        return (
          <StyledDiv key={key}>
            <Link
              data-qa-link
              to={
                crumbOverrides && override
                  ? override.linkTo
                    ? override.linkTo
                    : link
                  : link
              }
            >
              <StyledTypography
                data-qa-link-text
                data-testid={'link-text'}
                sx={{
                  ...(override &&
                    override.noCap && { textTransform: 'initial' }),
                }}
              >
                {crumbOverrides && override
                  ? override.label
                    ? override.label
                    : crumb
                  : crumb}
              </StyledTypography>
            </Link>
            <StyledSlashTypography>/</StyledSlashTypography>
          </StyledDiv>
        );
      })}
      {/* for prepending some SVG or other element before the final crumb. */}
      {labelOptions && labelOptions.prefixComponent && (
        <FinalCrumbPrefix
          prefixComponent={labelOptions.prefixComponent}
          prefixStyle={labelOptions.prefixStyle}
        />
      )}
      {/* the final crumb has the possibility of being a link, editable text or just static text */}
      <FinalCrumb
        crumb={labelTitle || lastCrumb}
        disabledBreadcrumbEditButton={disabledBreadcrumbEditButton}
        labelOptions={labelOptions}
        onEditHandlers={onEditHandlers}
      />
      {/*
      for appending some SVG or other element after the final crumb.
      See support ticket detail as an example
    */}
      {labelOptions &&
        labelOptions.suffixComponent &&
        labelOptions.suffixComponent}
    </>
  );
});
