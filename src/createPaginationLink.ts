import { ApolloLink, FieldPolicy, InMemoryCache } from '@apollo/client';
import { removeDirectivesFromDocument } from '@apollo/client/utilities';
import { ListValueNode, StringValueNode, visit } from 'graphql';
import get from 'lodash.get';

const appliedPolicies: string[] = [];

export function createPaginationLink(cache: InMemoryCache, paginatePolicies: Record<string, FieldPolicy>): ApolloLink {
  return new ApolloLink((operation, forward) => {
    const { query } = operation;
    const possibleDirectives = Object.keys(paginatePolicies);

    visit(query, {
      Directive(node, _key, _parent, path) {
        const foundDirective = possibleDirectives.find((directive) => directive === node.name.value);

        if (!foundDirective) {
          return;
        }

        // Clean Query
        operation.query = removeDirectivesFromDocument([{ name: foundDirective }], query) ?? query;

        const field = get(query, path.join('.').replace(/\.directives\.0$/, ''));

        const typenameArg = node.arguments?.find((arg) => arg.name.value === 'typename');
        const typename = (typenameArg?.value as StringValueNode)?.value ?? 'Query';

        const keyArgsArg = node.arguments?.find((arg) => arg.name.value === 'keyArgs');
        const keyArgs = (keyArgsArg?.value as ListValueNode)?.values.map((v) => (v as StringValueNode).value) ?? [];

        // Check if the policies are already applied
        const key = `${typename}-${field.name.value}`
        if (appliedPolicies.includes(key)) {
          return;
        }

        appliedPolicies.push(key);

        // Add Type Policies
        cache.policies.addTypePolicies({
          [typename]: {
            fields: {
              [field.name.value]: {
                keyArgs,
                ...paginatePolicies[foundDirective],
              },
            },
          },
        });
      },
    });

    return forward(operation);
  });
}
