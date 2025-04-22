import * as React from 'react';

/**
 * @param href string
 * @returns string[] or null
 */
export const opensInNewTab = (href: string) => {
  return href.match(/http/) || href.match(/mailto/);
};

/**
 * This function is used to flatten the children of the Link component into a single string to be used as the aria-label for external links.
 * @param children React.ReactNode
 * @returns string
 */
export const flattenChildrenIntoAriaLabel = (
  children: React.ReactNode,
): string => {
  if (typeof children === 'string') {
    return children;
  } else if (React.isValidElement(children)) {
    // If children is a single React element, extract its text content if any.
    return children.props.children
      ? flattenChildrenIntoAriaLabel(children.props.children)
      : '';
  } else if (Array.isArray(children)) {
    // If children is an array of React elements, flatten each child and join the results.
    return children
      .map((child) => flattenChildrenIntoAriaLabel(child))
      .join(' ')
      .trim();
  } else {
    // If children is neither a string nor a React element nor an array, return an empty string.
    return '';
  }
};

/**
 * This function is used to recursively determine if the children of the Link component contain any text.
 * If not, we issue a console error since the link won't be accessible to screen readers.
 * @param children React.ReactNode
 * @returns boolean
 */
export const childrenContainsNoText = (children: React.ReactNode): boolean => {
  if (typeof children === 'string') {
    return children.trim() === '';
  } else if (React.isValidElement(children)) {
    const { children: childText } = children.props;

    if (childText === null) {
      return true; // Consider null as having no text content.
    }

    if (typeof childText === 'string') {
      return childText.trim() === '';
    }

    // Check if the element is a valid container (e.g., React.Fragment) and has no text content.
    if (React.isValidElement(childText) || Array.isArray(childText)) {
      return childrenContainsNoText(childText);
    }

    return true; // Return true for other cases with non-string children.
  } else if (Array.isArray(children)) {
    return children.every((child) => childrenContainsNoText(child));
  } else {
    return true;
  }
};
