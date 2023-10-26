const utils = require("../utils");
const checkCssPropertyRecursively = utils.checkCssPropertyRecursively;

const css = {
  key: "fontWeight",
  literal: "font-weight",
};
const ERROR_MESSAGE =
  '** No font weight declarations in our code **.\nWe manage font weights through font family declarations.\nFor example, instead of specifying `fontWeight: "bold"`,\nuse: `fontFamily: theme.font.bold`.';

module.exports = {
  /**
   * Disallow the use of fontWeight css declarations in Cloud Manager styling
   */
  create(context) {
    return {
      // MakeStyle handler
      VariableDeclaration(node) {
        if (node.declarations) {
          for (const declarator of node.declarations) {
            if (
              declarator.id?.name === "useStyles" &&
              declarator.init?.arguments?.[0]?.type ===
                "ArrowFunctionExpression" &&
              declarator.init.arguments[0].body?.type === "ObjectExpression"
            ) {
              const properties = declarator.init.arguments[0].body.properties;
              checkCssPropertyRecursively(
                css,
                properties,
                context,
                ERROR_MESSAGE
              );
            }
          }
        }
      },
      // Styled Components handler
      CallExpression(node) {
        if (
          node.callee.type === "CallExpression" &&
          node.callee.callee.name === "styled"
        ) {
          const styledComponent = node.arguments?.[0];
          if (
            styledComponent?.type === "ArrowFunctionExpression" &&
            styledComponent?.body?.type === "ObjectExpression"
          ) {
            const properties = styledComponent.body.properties;
            checkCssPropertyRecursively(
              css,
              properties,
              context,
              ERROR_MESSAGE
            );
          }
        }
      },
      // JSX elements with sx or style
      JSXOpeningElement(node) {
        for (const attribute of node.attributes) {
          if (attribute.type === "JSXAttribute") {
            if (
              (attribute?.name?.name === "sx" ||
                attribute.name.name === "style") &&
              attribute.value?.type === "JSXExpressionContainer" &&
              attribute.value.expression?.type === "ObjectExpression"
            ) {
              checkCssPropertyRecursively(
                css,
                attribute.value.expression.properties,
                context,
                ERROR_MESSAGE
              );
            }
          }
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        "Disallow the use of fontWeight css declarations in Cloud Manager styling",
      recommended: true,
      url: null,
    },
    fixable: null,
    type: "problem",
  },
};
