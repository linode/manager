import * as React from 'react';

import styles from './Stack.module.css';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  alignItems?: 'baseline' | 'center' | 'flex-end' | 'flex-start' | 'stretch';
  children?: React.ReactNode;
  component?: React.ElementType;
  direction?: 'column' | 'row';
  /** Rendered between each child. */
  divider?: React.ReactNode;
  flexGrow?: React.CSSProperties['flexGrow'];
  flexWrap?: React.CSSProperties['flexWrap'];
  height?: React.CSSProperties['height'];
  justifyContent?:
    | 'center'
    | 'flex-end'
    | 'flex-start'
    | 'space-around'
    | 'space-between';
  spacing?: React.CSSProperties['gap'];
  width?: React.CSSProperties['width'];
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

/**
 * A flex layout container for arranging children in a row or column,
 * optionally separated by a divider. Native replacement for `Stack` from
 * `@linode/ui`/MUI: no `sx` prop — use `className` (CSS Modules) or
 * `style` instead.
 */
export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      alignItems,
      children,
      className,
      component = 'div',
      direction = 'column',
      divider,
      flexGrow,
      flexWrap,
      height,
      justifyContent,
      spacing,
      style: styleProp,
      width,
      ...rest
    },
    ref
  ) => {
    const Root = component;
    const resolvedClassName = [styles.stack, className]
      .filter(Boolean)
      .join(' ');

    const style: React.CSSProperties = {
      alignItems,
      flexDirection: direction,
      flexGrow,
      flexWrap,
      gap: spacing,
      height,
      justifyContent,
      width,
      ...styleProp,
    };

    return (
      <Root className={resolvedClassName} ref={ref} style={style} {...rest}>
        {divider ? joinChildren(children, divider) : children}
      </Root>
    );
  }
);
