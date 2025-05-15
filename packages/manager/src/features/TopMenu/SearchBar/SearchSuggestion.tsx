import { Box, Chip, SvgIcon } from '@linode/ui';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { searchableEntityIconMap } from 'src/features/Search/utils';

import {
  StyledSearchSuggestion,
  StyledSegment,
  StyledSuggestionDescription,
  StyledSuggestionIcon,
  StyledSuggestionTitle,
  StyledTagContainer,
} from './SearchSuggestion.styles';

import type { SearchableItem } from 'src/features/Search/search.interfaces';

export interface SearchSuggestionProps {
  data: SearchableItem;
  searchText: string;
  selectOption: (option: unknown) => void;
  selectProps: {
    onMenuClose: () => void;
  };
}

export const SearchSuggestion = (props: SearchSuggestionProps) => {
  const { data, searchText, selectOption, selectProps, ...rest } = props;
  const history = useHistory();

  const Icon = searchableEntityIconMap[data.entityType];

  const handleClick = () => {
    selectOption(data);
  };

  const handleTagQuery = (
    e: React.MouseEvent<HTMLDivElement>,
    label: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    history.push(`/search/?query=tag:${label}`);
    selectProps.onMenuClose();
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
      <Chip
        className="tag"
        key={`tag-${tag}`}
        label={tag}
        onClick={(e) => handleTagQuery(e, tag)}
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
          <SvgIcon>
            <Icon />
          </SvgIcon>
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
              {maybeStyleSegment(data.label, searchText)}
            </StyledSuggestionTitle>
            <StyledSuggestionDescription data-qa-suggestion-desc>
              {data.data.description}
            </StyledSuggestionDescription>
          </Box>
          <StyledTagContainer className="tag-container">
            {data.data.tags && renderTags(data.data.tags)}
          </StyledTagContainer>
        </Box>
      </Box>
    </StyledSearchSuggestion>
  );
};
