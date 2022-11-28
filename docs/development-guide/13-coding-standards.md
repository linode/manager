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

## CSS

The styles for Cloud Manager are located in three places:

- `packages/manager/src/index.css` contains global styles, utility styles, and accessibility related styles.
- `packages/manager/src/themeFactory.ts` and `packages/manager/src/themes.ts`contains code for modifying the default [Material UI](https://mui.com) styles and theme specific styles.
  - Light mode styles are located in `themeFactory.ts` and dark mode styles are located in `themes.ts`
  - The breakpoints can be modified at the end of `themeFactory.ts`
- Component specific styles should be inside the component itself.
  - If the component is a functional component, it is preferable to use Material UI's `useStyles` pattern over `withStyles` which should only be reserved for class components.
