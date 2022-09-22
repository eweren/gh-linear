import { ApolloClient, gql, HttpLink, InMemoryCache } from '@apollo/client';
import { getConfig } from '../shared/config';
import { labelMapping } from '../shared/constants';
import { LinearSearchQuery, LinearTicket } from '../shared/types';
import fetch from 'cross-fetch';

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

export function getSearchVariables(value: string, filterForMyIssues: boolean): LinearSearchQuery {
  const variables: LinearSearchQuery = {
    filter: {
      state: {
        type: {
          neq: "canceled"
        }
      },
      completedAt: {
        null: true
      }
    },
    first: 75
  }
  if (filterForMyIssues) {
    variables["filter"]["assignee"] = {
      isMe: {
        eq: filterForMyIssues ? true : undefined
      }
    };
  }

  if (value) {
    if (/^\w{3}.\d+$/.test(value)) {
      variables["filter"] = {
        and: {
          team: {
            key: {
              eq: /\w{3}/.test(value) ? value.match(/\w{3}/)![0]!.toUpperCase() : undefined
            }
          },
          number: {
            eq: /\d+/.test(value) ? parseInt(value.match(/\d+/)![0]!) : undefined
          }
        }
      };
    } else if (/^\w{3}$/.test(value)) {
      variables["filter"]["team"] = {
        key: {
          eq: value.toUpperCase()
        }
      };
    } else {
      variables["filter"]["or"] = {
        title: {
          contains: value
        },
        team: {
          key: {
            eq: /\w{3}/.test(value) ? value.match(/\w{3}/)![0]!.toUpperCase() : undefined
          }
        },
        number: {
          eq: /\d+/.test(value) ? parseInt(value.match(/\d+/)![0]!) : undefined
        }
      };
    }
  }
  return variables;
}

export async function getTickets(value: string, filterForMyIssues: boolean): Promise<LinearTicket[]> {
  const response = await LinearClient.query({ query: IssueQuery, variables: getSearchVariables(value, filterForMyIssues) });

  let tickets = new Array<LinearTicket>();
  if (response && response.data && response.data.issues) {
    tickets = (response.data.issues.nodes as LinearTicket[])
      .slice()
      .sort((a, b) => a.state.position === b.state.position ? b.priority - a.priority : b.state.position - a.state.position);
  }
  return tickets;
}

export function getTicketType(ticket: LinearTicket): string {
  return labelMapping[(ticket.labels.nodes[0]?.name ?? "Improvement") as keyof typeof labelMapping];
}

const httpLink = new HttpLink({
  fetch,
  uri: "https://api.linear.app/graphql",
  headers: {
    authorization: `Bearer ${getConfig().linearToken?.trim()}`
  }
});

export const LinearClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
});