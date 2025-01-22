import { Box } from '@linode/ui';
import * as React from 'react';

import { EntityIcon } from 'src/components/EntityIcon/EntityIcon';
import { Tag } from 'src/components/Tag/Tag';
import { linodeInTransition } from 'src/features/Linodes/transitions';

import {
  StyledSearchSuggestion,
  StyledSegment,
  StyledSuggestionDescription,
  StyledSuggestionIcon,
  StyledSuggestionTitle,
  StyledTagContainer,
} from './SearchSuggestion.styles';

import type { LinodeStatus } from '@linode/api-v4/lib/linodes';
import type { EntityVariants } from 'src/components/EntityIcon/EntityIcon';

export interface SearchSuggestionT {
  description: string;
  icon: EntityVariants;
  path: string;
  searchText: string;
  status?: LinodeStatus;
  tags?: string[];
}

export interface SearchSuggestionProps {
  data: {
    data: SearchSuggestionT;
    label: string;
  };
  searchText: string;
  selectOption: (option: unknown) => void;
  selectProps: {
    onMenuClose: () => void;
  };
}

export const SearchSuggestion = (props: SearchSuggestionProps) => {
  const { data, searchText, selectOption, selectProps, ...rest } = props;
  const { data: suggestionData, label } = data;
  const { description, icon, status, tags } = suggestionData;
  const searchResultIcon = icon || 'default';

  const handleClick = () => {
    selectOption(data);
  };

  const maybeStyleSegment = (
    text: string,
    searchText: string
  ): React.ReactNode => {
    if (!text || !searchText) {
      return null;
    }

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

  const renderTags = (tags: string[]) => {
    if (tags.length === 0) {
      return;
    }

    return tags.map((tag: string) => (
      <Tag
        className="tag"
        closeMenu={selectProps.onMenuClose}
        colorVariant="lightBlue"
        component={'button' as 'div'}
        key={`tag-${tag}`}
        label={tag}
      />
    ));
  };

  return (
    <StyledSearchSuggestion
      {...rest}
      data-qa-suggestion
      onClick={handleClick}
      onKeyDown={handleClick}
      role="option"
    >
      <Box
        sx={{
          display: 'flex',
          flexFlow: 'row nowrap',
        }}
        width="100%"
      >
        <StyledSuggestionIcon>
          <EntityIcon
            loading={status && linodeInTransition(status)}
            size={20}
            status={status}
            variant={searchResultIcon}
          />
        </StyledSuggestionIcon>
        <Box
          display="flex"
          flexWrap="wrap"
          justifyContent="space-between"
          sx={(theme) => ({ padding: theme.spacing(1) })}
          width="100%"
        >
          <Box display="flex" flexDirection="column" marginRight={1}>
            <StyledSuggestionTitle data-qa-suggestion-title>
              {maybeStyleSegment(label, searchText)}
            </StyledSuggestionTitle>
            <StyledSuggestionDescription data-qa-suggestion-desc>
              {description}
            </StyledSuggestionDescription>
          </Box>
          <StyledTagContainer className="tag-container">
            {tags && renderTags(tags)}
          </StyledTagContainer>
        </Box>
      </Box>
    </StyledSearchSuggestion>
  );
};