function checkFontWeightRecursively(properties, context) {
  for (const property of properties) {
    if (property.type === "Property" && property.key?.name === "fontWeight") {
      context.report({
        node: property,
        message:
          "Avoid using fontWeight declaration in our code since we declare font weight using fontFamily",
      });
    } else if (
      property.type === "Property" &&
      property.value?.type === "ObjectExpression"
    ) {
      checkFontWeightRecursively(property.value.properties, context);
    }
  }
}

module.exports = {
  "no-custom-fontWeight": {
    create(context) {
      return {
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
                checkFontWeightRecursively(properties, context);
              }
            }
          }
        },
      };
    },
    meta: {
      docs: {
        description: "Disallow the use of fontWeight in Cloud Manager styling",
        recommended: true,
        url: null,
      },
      fixable: null,
      type: "problem",
    },
  },
};
