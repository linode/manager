import * as React from 'react';

import { Link } from '../Link';
import {
  StyledDiv,
  StyledEditableText,
  StyledH1Header,
} from './FinalCrumb.styles';

import type { EditableProps, LabelProps } from './types';

interface Props {
  crumb: string;
  disabledBreadcrumbEditButton?: boolean;
  labelOptions?: LabelProps;
  onEditHandlers?: EditableProps;
}

export const FinalCrumb = React.memo((props: Props) => {
  const { crumb, disabledBreadcrumbEditButton, labelOptions, onEditHandlers } =
    props;

  const linkProps = labelOptions?.linkTo
    ? {
        LinkComponent: Link,
        labelLink: labelOptions.linkTo,
      }
    : {};

  if (onEditHandlers) {
    return (
      <StyledEditableText
        data-qa-editable-text
        disabledBreadcrumbEditButton={disabledBreadcrumbEditButton}
        errorText={onEditHandlers.errorText}
        handleAnalyticsEvent={onEditHandlers.handleAnalyticsEvent}
        isBreadcrumb
        onCancel={onEditHandlers.onCancel}
        onEdit={onEditHandlers.onEdit}
        text={onEditHandlers.editableTextTitle}
        {...linkProps}
      />
    );
  }

  return (
    <StyledDiv>
      <StyledH1Header
        dataQaEl={crumb}
        sx={{
          ...(labelOptions &&
            labelOptions.noCap && { textTransform: 'initial' }),
        }}
        title={crumb}
      />
    </StyledDiv>
  );
});
