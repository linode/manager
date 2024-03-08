import * as React from 'react';

import {
  StyledDiv,
  StyledEditableText,
  StyledH1Header,
} from './FinalCrumb.styles';
import { EditableProps, LabelProps } from './types';

interface Props {
  crumb: string;
  disableEditButton?: boolean;
  labelOptions?: LabelProps;
  onEditHandlers?: EditableProps;
}

export const FinalCrumb = React.memo((props: Props) => {
  const { crumb, disableEditButton, labelOptions, onEditHandlers } = props;

  if (onEditHandlers) {
    return (
      <StyledEditableText
        data-qa-editable-text
        disableEditButton={disableEditButton}
        errorText={onEditHandlers.errorText}
        handleAnalyticsEvent={onEditHandlers.handleAnalyticsEvent}
        labelLink={labelOptions && labelOptions.linkTo}
        onCancel={onEditHandlers.onCancel}
        onEdit={onEditHandlers.onEdit}
        text={onEditHandlers.editableTextTitle}
        textSuffix={onEditHandlers.editableTextTitleSuffix}
      />
    );
  }

  return (
    <StyledDiv>
      <StyledH1Header
        sx={{
          ...(labelOptions &&
            labelOptions.noCap && { textTransform: 'initial' }),
        }}
        dataQaEl={crumb}
        title={crumb}
      />
    </StyledDiv>
  );
});
