# Coding Standards

## Linting

We use [ESLint](https://eslint.org/) to enforce coding and formatting standards. The config is found at `packages/manager/.eslintrc.js`. We also use several plugins to extend linting features; here are just a few:

- **@typescript-eslint** (TypeScript-specific rules)
- **jsx-a11y** (accessibility)
- **prettier** (code formatting)
- **scanjs** (security)

If you are using VSCode it is highly recommended to use the ESlint extension. The Prettier extension is also recommended, as it can be configured to format your code on save.

## React

- When conditionally rendering JSX, use ternaries instead of `&&`.
  - Example: `condition ? <Component /> : null` instead of `condition && <Component />`
  - This is to avoid hard-to-catch bugs ([read more](https://kentcdodds.com/blog/use-ternaries-rather-than-and-and-in-jsx)).
