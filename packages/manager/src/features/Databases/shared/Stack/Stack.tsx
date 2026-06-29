import React from 'react';

import styles from './stack.module.css';

export interface StackProps {
  alignItems?: 'baseline' | 'center' | 'flex-end' | 'flex-start' | 'stretch';
  children: React.ReactNode;
  className?: string;
  direction?: 'column' | 'row';
  /**
   * Add an element between each child.
   */
  divider?: React.ReactNode;
  flexGrow?: number;
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  height?: string;
  justifyContent?:
    | 'center'
    | 'flex-end'
    | 'flex-start'
    | 'space-around'
    | 'space-between';
  spacing?: string;
  style?: React.CSSProperties;
  width?: string;
}

const getValidReactChildren = (
  children: React.ReactNode
): React.ReactElement[] => {
  return React.Children.toArray(children).filter(
    (child): child is React.ReactElement => React.isValidElement(child)
  );
};

const joinChildren = (
  children: React.ReactNode,
  divider: React.ReactNode
): React.ReactNode[] => {
  const childrenArray = getValidReactChildren(children);

  return childrenArray.reduce<React.ReactNode[]>((output, child, index) => {
    output.push(child);

    if (index < childrenArray.length - 1) {
      output.push(
        React.cloneElement(divider as React.ReactElement, {
          key: `divider-${index}`,
        })
      );
    }

    return output;
  }, []);
};

export const Stack = ({
  alignItems,
  children,
  className,
  direction = 'column',
  divider,
  flexGrow,
  flexWrap,
  height,
  justifyContent,
  spacing,
  style: styleProp,
  width,
}: StackProps) => {
  const style: React.CSSProperties = {
    alignItems,
    flexDirection: direction,
    flexGrow,
    flexWrap,
    height,
    gap: spacing,
    justifyContent,
    width,
    ...styleProp,
  };

  return (
    <div
      className={[styles.stack, className].filter(Boolean).join(' ')}
      style={style}
    >
      {divider ? joinChildren(children, divider) : children}
    </div>
  );
};
