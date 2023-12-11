// Styled component using omittedProps
import styled from '@emotion/styled';

import { omittedProps } from './omittedProps';

type StyledProps = {
  anotherProp?: string;
  color: string;
  extraProp?: string;
};

const MyStyledComponent = styled('div', {
  label: 'MyStyledComponent',
  shouldForwardProp: omittedProps<StyledProps>(['extraProp', 'anotherProp']),
})<StyledProps>`
  color: ${(props) => props.color};
`;

// Unit test for the styled component
import { render, screen } from '@testing-library/react';
import React from 'react';

describe('omittedProps utility', () => {
  it('filters out omitted props', () => {
    render(
      <MyStyledComponent
        anotherProp="another"
        color="red"
        data-testid="styled-component"
        extraProp="extra"
      />
    );

    const component = screen.getByTestId('styled-component');

    expect(component).not.toHaveAttribute('extraProp');
    expect(component).not.toHaveAttribute('anotherProp');
    expect(component).toHaveStyle('color: rgb(255, 0, 0)');
  });
});
