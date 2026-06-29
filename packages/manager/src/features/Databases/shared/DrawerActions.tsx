import React from 'react';

import styles from './DrawerActions.module.css';

interface Props {
  children: React.ReactNode;
}

/**
 * A horizontal container for drawer action buttons.
 *
 * Ideally, we'd just use the `footer` slot of the `Drawer` component to handle this,
 * but that does not work because the `footer` slot element must be a direct child
 * of the `Drawer` component, but most of our drawers use a child <form> to manage
 * form state and submission preventing the `footer` slot from being a direct child
 * of the `Drawer` component. Therefore, we use this `DrawerActions` component and
 * just place it in the body of the `Drawer` for now until we figure out a better solution.
 *
 * One possible solution is for the CDS Button component to support a `form` prop that would
 * allow us to place the action buttons outside of the form element but still have them trigger form submission when clicked.
 */
export const DrawerActions = (props: Props) => {
  return <div className={styles['drawer-actions']}>{props.children}</div>;
};
