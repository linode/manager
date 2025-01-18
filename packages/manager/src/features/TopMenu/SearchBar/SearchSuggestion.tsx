import { Chip } from '@linode/ui';
import { Box } from '@linode/ui';
import { pathOr } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { EntityIcon } from 'src/components/EntityIcon/EntityIcon';
import { linodeInTransition } from 'src/features/Linodes/transitions';

import {
  StyledSegment,
  StyledSuggestionDescription,
  StyledSuggestionIcon,
  StyledSuggestionTitle,
  StyledTagContainer,
  StyledWrapperDiv,
} from './SearchSuggestion.styles';

import type { LinodeStatus } from '@linode/api-v4/lib/linodes';
import type { OptionProps } from 'react-select';

export interface SearchSuggestionT {
  description: string;
  history: any;
  icon: string;
  isHighlighted?: boolean;
  path: string;
  searchText: string;
  status?: LinodeStatus;
  tags?: string[];
}

export interface SearchSuggestionProps extends OptionProps<any, any> {
  data: {
    data: SearchSuggestionT;
    label: string;
  };
  searchText: string;
}

export const SearchSuggestion = (props: SearchSuggestionProps) => {
  const { data, innerProps, innerRef, label } = props;
  const { description, icon, searchText, status, tags } = data.data;
  const searchResultIcon = pathOr<string>('default', [], icon);
  const history = useHistory();
  const handleClick = () => {
    const suggestion = data;
    props.selectOption(suggestion);
  };

  const maybeStyleSegment = (
    text: string,
    searchText: string
  ): React.ReactNode => {
    const idx = text
      .toLocaleLowerCase()
      .indexOf(searchText.toLocaleLowerCase());
    if (idx === -1) {
      return text;
    }

    return (
      <React.Fragment>
        {`${text.substring(0, idx)}`}
        <StyledSegment>
          {`${text.slice(idx, idx + searchText.length)}`}
        </StyledSegment>
        {`${text.slice(idx + searchText.length)}`}
      </React.Fragment>
    );
  };

  const handleTagQuery = (
    e: React.MouseEvent<HTMLDivElement>,
    label: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    history.push(`/search/?query=tag:${label}`);
  };

  const renderTags = (tags: string[]) => {
    if (tags.length === 0) {
      return;
    }
    return tags.map((tag: string) => (
      <Chip
        className="tag"
        key={`tag-${tag}`}
        label={tag}
        onClick={(e) => handleTagQuery(e, tag)}
      />
    ));
  };

  return (
    <StyledWrapperDiv
      data-qa-selected={Boolean(props.isFocused)}
      data-qa-suggestion
      isFocused={Boolean(props.isFocused)}
      onKeyDown={handleClick}
      ref={innerRef}
      {...innerProps}
      // overrides onClick from InnerProps
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <Box sx={{ display: 'flex', flexFlow: 'row nowrap' }}>
        <StyledSuggestionIcon>
          <EntityIcon
            loading={status && linodeInTransition(status)}
            size={20}
            status={status}
            variant={searchResultIcon}
          />
        </StyledSuggestionIcon>
        <Box sx={(theme) => ({ padding: theme.tokens.spacing[40] })}>
          <StyledSuggestionTitle data-qa-suggestion-title>
            {maybeStyleSegment(label, searchText)}
          </StyledSuggestionTitle>
          <StyledSuggestionDescription data-qa-suggestion-desc>
            {description}
          </StyledSuggestionDescription>
        </Box>
      </Box>
      <StyledTagContainer>{tags && renderTags(tags)}</StyledTagContainer>
    </StyledWrapperDiv>
  );
};
