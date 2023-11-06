import * as React from 'react';

import { Typography } from 'src/components/Typography';

import { EditableProps, LabelProps } from './types';

import {
  StyledDiv,
  StyledEditableText,
  StyledH1Header,
} from './FinalCrumbs.styles';

interface Props {
  crumb: string;
  labelOptions?: LabelProps;
  onEditHandlers?: EditableProps;
  subtitle?: string;
}

export const FinalCrumb = React.memo((props: Props) => {
  const { crumb, labelOptions, onEditHandlers } = props;

  if (onEditHandlers) {
    return (
      <StyledEditableText
        data-qa-editable-text
        errorText={onEditHandlers.errorText}
        labelLink={labelOptions && labelOptions.linkTo}
        onCancel={onEditHandlers.onCancel}
        onEdit={onEditHandlers.onEdit}
        text={onEditHandlers.editableTextTitle}
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
      {labelOptions && labelOptions.subtitle && (
        <Typography data-qa-label-subtitle variant="body1">
          {labelOptions.subtitle}
        </Typography>
      )}
    </StyledDiv>
  );
});
