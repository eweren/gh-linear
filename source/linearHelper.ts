import { gql } from '@apollo/client';

export const IssueQuery = gql`
  query MyIssues($filter: IssueFilter, $first: Int) {
    issues(filter: $filter, first: $first) {
      nodes {
        id
        title
        number
        priority
        branchName
        state {
          name
          color
          position
          type
        }
        team {
          key
        }
        labels(first: 1) {
          nodes {
            name
          }
        }
        url
        integrationResources(first: 3) {
          nodes {
            pullRequest {
              url
            }
          }
        }
      }
    }
  }
`;