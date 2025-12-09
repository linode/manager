export default {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow template literals without expressions',
            recommended: false,
        },
        messages: {
            useNormalString: 'Avoid using template literals when no interpolation is needed.',
        },
        schema: [],
    },

    create(context) {
        return {
            TemplateLiteral(node) {
                const hasExpressions = node.expressions.length > 0;
                const isSingleQuasi = node.quasis.length === 1;

                if (!hasExpressions && isSingleQuasi) {
                    context.report({
                        node,
                        messageId: 'useNormalString',
                    });
                }
            },
        };
    },
};