# Apollo Link Pagination
A `@pagination` directive for GraphQL queries

## Installation

```
yarn add apollo-link-pagination
```

This package is not available with Apollo Client v1 and v2 because it uses `typePolicies` feature in v3.

## Usage

Crerate Apollo Client instance with `createPaginationLink` and your own pagination directives. Note that `paginationLink` should be appear before `httpLink`.

```typescript
import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  createHttpLink,
} from '@apollo/client';
import {
  createPaginationLink,
  cursorPagination,
  offsetLimitPagination,
} from 'apollo-link-pagination';

const cache = new InMemoryCache();

const httpLink = createHttpLink({
  uri: 'https://rxfl5l9xw6.execute-api.ap-northeast-2.amazonaws.com/dev/graphql'
});

const paginationLink = createPaginationLink(cache, {
  cursorPagination: cursorPagination(),
  offsetLimitPagination: offsetLimitPagination(),
  // or you can define your own pagination directives.
});

const client = new ApolloClient({
  cache,
  link: ApolloLink.from([paginationLink, httpLink]),
});
```

Suppose the GraphQL schema is:

```graphql
enum FriendType {
  BEST
  NORMAL
}

type User {
  id: ID!
  name: String!
  friends(type: FriendType, offset: Int, limit: Int!): [User]
}

type UsersResult {
  users: [User]
  cursor: ID
}

type Query {
  user(id: ID!): User
  usersByCursor(cursor: ID, limit: Int!): UsersResult
}
```

Cursor-based pagination queries can be written as follows:

```graphql
query Users($cursor: ID, $offset: Int) {
  usersByCursor(cursor: $cursor, limit: 10) @cursorPagination {
    users {
      id
      name
    }
    cursor
  }
}
```

Offset-based pagination queries can be written as follows:

```graphql
query Friends($type: FriendType, $offset: Int) {
  user(id: "1") {
    id
    name
    friends(
      type: $type,
      offset: $offset,
      limit: 10,
    ) @offsetLimitPagination(keyArgs: ["type"], typename: "User") {
      id
      name
    }
  }
}
```

If you do not specify a `typename` argument, it is automatically assigned as `"Query"`.

### License

This package is available as open source under the terms of the MIT License.
