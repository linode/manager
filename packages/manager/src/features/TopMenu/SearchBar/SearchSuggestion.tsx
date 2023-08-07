import { LinodeStatus } from '@linode/api-v4/lib/linodes';
import { styled } from '@mui/material/styles';
import { pathOr } from 'ramda';
import * as React from 'react';
import { OptionProps } from 'react-select';

import { EntityIcon } from 'src/components/EntityIcon/EntityIcon';
import { Tag } from 'src/components/Tag/Tag';
import { linodeInTransition } from 'src/features/Linodes/transitions';
import { isPropValid } from 'src/utilities/isPropValid';

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

interface Props extends OptionProps<any, any> {
  data: {
    data: SearchSuggestionT;
    label: string;
  };
  searchText: string;
}

export const SearchSuggestion = (props: Props) => {
  const { data, innerProps, innerRef, label, selectProps } = props;
  const { description, icon, searchText, status, tags } = data.data;
  const searchResultIcon = pathOr<string>('default', [], icon);

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
          {`${text.substring(idx, searchText.length)}`}
        </StyledSegment>
        {`${text.slice(idx + searchText.length)}`}
      </React.Fragment>
    );
  };

  const renderTags = (tags: string[], selected: boolean) => {
    if (tags.length === 0) {
      return;
    }
    return tags.map((tag: string) => (
      <Tag
        asSuggestion={true}
        className="tag"
        closeMenu={selectProps.onMenuClose}
        colorVariant={selected ? 'blue' : 'lightBlue'}
        component={'button' as 'div'}
        key={`tag-${tag}`}
        label={tag}
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
      <div style={{ display: 'flex', flexFlow: 'row nowrap' }}>
        <StyledSuggestionIcon>
          <EntityIcon
            loading={status && linodeInTransition(status)}
            size={20}
            status={status}
            variant={searchResultIcon}
          />
        </StyledSuggestionIcon>
        <div style={{ padding: '8px' }}>
          <StyledSuggestionTitle data-qa-suggestion-title>
            {maybeStyleSegment(label, searchText)}
          </StyledSuggestionTitle>
          <StyledSuggestionDescription data-qa-suggestion-desc>
            {description}
          </StyledSuggestionDescription>
        </div>
      </div>
      <StyledTagContainer>
        {tags && renderTags(tags, Boolean(props.isFocused))}
      </StyledTagContainer>
    </StyledWrapperDiv>
  );
};

const StyledWrapperDiv = styled('div', {
  label: 'StyledWrapperDiv',
  shouldForwardProp: (prop) => isPropValid(['isFocused'], prop),
})<Partial<Props>>(({ isFocused, theme }) => ({
  '&:last-child': {
    borderBottom: 0,
  },
  alignItems: 'space-between',
  borderBottom: `1px solid ${theme.palette.divider}`,
  cursor: 'pointer',
  justifyContent: 'space-between',
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
  width: 'calc(100% + 2px)',

  ...(isFocused && {
    '& .tag': {
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: 'white',
      },
      backgroundColor: theme.bg.lightBlue1,
      color: theme.palette.text.primary,
    },
    backgroundColor: `${theme.bg.main} !important`,
  }),
}));

const StyledSuggestionIcon = styled('div', {
  label: 'StyledSuggestionIcon',
})(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  marginLeft: theme.spacing(1.5),
  padding: theme.spacing(),
}));

const StyledSuggestionTitle = styled('div', {
  label: 'StyledSuggestionTitle',
})(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: '1rem',
  fontWeight: 600,
  wordBreak: 'break-all',
}));

const StyledSegment = styled('span', {
  label: 'StyledSegment',
})(({ theme }) => ({
  color: theme.palette.primary.main,
}));

const StyledSuggestionDescription = styled('div', {
  label: 'StyledSuggestionDescription',
})(({ theme }) => ({
  color: theme.color.headline,
  fontSize: '.75rem',
  marginTop: 2,
}));

const StyledTagContainer = styled('div', {
  label: 'StyledTagContainer',
})(() => ({
  '& > div': {
    margin: '2px',
  },
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  paddingRight: 8,
}));
