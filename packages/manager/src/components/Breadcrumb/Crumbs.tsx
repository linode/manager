import { LocationDescriptor } from 'history';
import * as React from 'react';
import { Link } from 'react-router-dom';

import {
  StyledDiv,
  StyledSlashTypography,
  StyledTypography,
} from './Crumbs.styles';
import { FinalCrumb } from './FinalCrumb';
import { FinalCrumbPrefix } from './FinalCrumbPrefix';
import { EditableProps, LabelProps } from './types';

export interface CrumbOverridesProps {
  label?: string;
  linkTo?: LocationDescriptor;
  noCap?: boolean;
  position: number;
}

interface Props {
  crumbOverrides?: CrumbOverridesProps[];
  firstAndLastOnly?: boolean;
  labelOptions?: LabelProps;
  labelTitle?: string;
  onEditHandlers?: EditableProps;
  pathMap: string[];
}

export const Crumbs = React.memo((props: Props) => {
  const {
    crumbOverrides,
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
              to={
                crumbOverrides && override
                  ? override.linkTo
                    ? override.linkTo
                    : link
                  : link
              }
              data-qa-link
            >
              <StyledTypography
                sx={{
                  ...(override &&
                    override.noCap && { textTransform: 'initial' }),
                }}
                data-qa-link-text
                data-testid={'link-text'}
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
