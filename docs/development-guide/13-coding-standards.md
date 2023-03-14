# Coding Standards

## Linting

We use [ESLint](https://eslint.org/) to enforce coding and formatting standards. The config is found at `packages/manager/.eslintrc.js`. We also use several plugins to extend linting features; here are just a few:

- **@typescript-eslint** (TypeScript-specific rules)
- **markdownlint** (Markdown-specific rules)
- **MDX** (MDX-specific rules)
- **jsx-a11y** (accessibility)
- **prettier** (code formatting)
- **scanjs** (security)

If you are using VSCode it is highly recommended to use the ESlint extension. The Prettier extension is also recommended, as it can be configured to format your code on save.

## React

- When conditionally rendering JSX, use ternaries instead of `&&`.
  - Example: `condition ? <Component /> : null` instead of `condition && <Component />`
  - This is to avoid hard-to-catch bugs ([read more](https://kentcdodds.com/blog/use-ternaries-rather-than-and-and-in-jsx)).


## Event Handler Naming Convention:
In React, it's a convention to prefix prop names that hold event handler functions with `on`, such as `onClick`, `onSubmit`, `onFocus`, etc. This convention helps in maintaining consistency and readability across the codebase. By following this convention, we declare that these props will be used for event handler functions.

Similarly, when defining function names that handle events or perform some action, it's a convention to prefix them with `handle`. For example, if we have a component that handles a click event, we can define a function named `handleClick` that performs the desired action. This convention helps to distinguish between functions that handle events and other functions that perform different actions.

Example of prop naming:
```
<TextField onChange={handleInputChange} />
```
Example of function naming:
```
function handleInputChange(event) {...}
```

More complex names can be handled with the same convention:
```
API: {prefix}{noun}{verb}
Prop: onLabelChange
Function: handleLabelChange
```

## CSS

The styles for Cloud Manager are located in three places:

- `packages/manager/src/index.css` contains global styles, utility styles, and accessibility related styles.
- `packages/manager/src/themeFactory.ts` and `packages/manager/src/themes.ts` contain code for modifying the default [Material UI](https://mui.com) styles and theme specific styles.
  - Light mode styles are located in `themeFactory.ts` and dark mode styles are located in `themes.ts`.
  - The breakpoints can be modified at the end of `themeFactory.ts`.
- Component-specific styles may be defined either at the end of the component file or in a dedicated file, named `ComponentName.styles.tsx`. Refer to the guidelines outlined in the "Styles" section of [Component Structure](02-component-structure.md#styles). 