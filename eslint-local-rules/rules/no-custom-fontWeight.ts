import { checkCssPropertyRecursively } from "../utils/checkCssPropertyRecursively";

import type { Rule } from "eslint";

const css = {
  key: "fontWeight",
  literal: "font-weight",
};
const ERROR_MESSAGE =
  '** No font weight declarations in our code in order to avoid faux-bold **.\nWe manage font weights through font family declarations.\nFor example, instead of specifying `fontWeight: "bold"`,\nuse: `fontFamily: theme.font.bold`.';

/**
 * Disallow the use of fontWeight css declarations in Cloud Manager styling
 */
export const noCustomFontWeight: Rule.RuleModule = {
  meta: {
    docs: {
      category: "Stylistic Issues",
      description:
        "Disallow the use of fontWeight css declarations in Cloud Manager styling",
      recommended: true,
    },
  },
  create(context) {
    return {
      // MakeStyle handler
      VariableDeclaration(node) {
        if (node.declarations) {
          for (const declarator of node.declarations) {
            if (
              declarator.id &&
              "name" in declarator.id && // adding type guard to satisfy TS
              declarator.id.name === "useStyles" &&
              declarator.init?.type === "CallExpression" &&
              declarator.init.arguments?.[0]?.type ===
                "ArrowFunctionExpression" &&
              declarator.init.arguments[0].body?.type === "ObjectExpression"
            ) {
              const properties = declarator.init.arguments[0].body.properties;
              checkCssPropertyRecursively({
                css,
                properties,
                context,
                message: ERROR_MESSAGE,
              });
            }
          }
        }
      },
      // Styled Components handler
      CallExpression(node) {
        if (
          node.callee.type === "CallExpression" &&
          "name" in node.callee.callee && // adding type guard to satisfy TS
          node.callee.callee.name === "styled"
        ) {
          const styledComponent = node.arguments?.[0];
          if (
            styledComponent?.type === "ArrowFunctionExpression" &&
            styledComponent?.body?.type === "ObjectExpression"
          ) {
            const properties = styledComponent.body.properties;
            checkCssPropertyRecursively({
              css,
              properties,
              context,
              message: ERROR_MESSAGE,
            });
          }
        }
      },
      // JSX elements with sx or style
      JSXOpeningElement(node) {
        for (const attribute of node.attributes) {
          if (attribute.type === "JSXAttribute") {
            // Any component with sx or style
            if (
              (attribute?.name?.name === "sx" ||
                attribute.name.name === "style") &&
              attribute.value?.type === "JSXExpressionContainer" &&
              attribute.value.expression?.type === "ObjectExpression"
            ) {
              checkCssPropertyRecursively({
                css,
                properties: attribute.value.expression.properties,
                context,
                message: ERROR_MESSAGE,
              });
            }

            // Any component with a fontWeight prop
            if (attribute.name.name === css.key) {
              context.report({
                node,
                message: ERROR_MESSAGE,
              });
            }
          }
        }
      },
    };
  },
};
