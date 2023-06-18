import { ApolloClient, gql, HttpLink, InMemoryCache } from '@apollo/client';
import { getConfig } from '../shared/config';
import { labelMapping } from '../shared/constants';
import { LinearSearchQuery, LinearSelfAssignInput, LinearTicket } from '../shared/types';
import fetch from 'cross-fetch';

const SelfAssignIssue = gql`
  mutation SelfAssignIssue($input: IssueUpdateInput!, $issueUpdateId: String!) {
    issueUpdate(input: $input, id: $issueUpdateId) {
      success
    }
  }
`;

const AvailableUsers = gql`
  query AvailableUsers {
    availableUsers {
      users {
        isMe
        id
      }
    }
  }
`;

const IssueQuery = gql`
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
        attachments(first: 3, filter: { sourceType: { eq: "github" }}) {
          nodes {
            url
          }
        }
      }
    }
  }
`;

const OrganizationQuery = gql`
  query Organization {
    organization {
      id
    }
  }
`;

export default class Linear {

  private static get client() {
    return new ApolloClient({
      link: new HttpLink({
        fetch,
        uri: "https://api.linear.app/graphql",
        headers: {
          authorization: `Bearer ${getConfig().linearToken?.trim()}`
        }
      }),
      cache: new InMemoryCache()
    });
  }

  public static async getMyId(): Promise<string | undefined> {
    const { data } = await Linear.client.query({ query: AvailableUsers })
    const users = data?.availableUsers?.users as { isMe: boolean, id: string }[] | undefined;
    return users?.find(u => u.isMe === true)?.id
  }

  public static async isValidApiKey(): Promise<boolean> {
    try {
      const { data } = await Linear.client.query({ query: OrganizationQuery })
      const users = data?.organization?.id;
      return !!users;
    } catch (_) {
      return false;
    }
  }

  private static getSearchVariables(value: string, filterForMyIssues: boolean): LinearSearchQuery {
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

  public static async getTickets(value: string, filterForMyIssues: boolean): Promise<LinearTicket[]> {
    const response = await this.client.query({ query: IssueQuery, variables: this.getSearchVariables(value, filterForMyIssues) });

    let tickets = new Array<LinearTicket>();
    if (response && response.data && response.data.issues) {
      tickets = (response.data.issues.nodes as LinearTicket[])
        .slice()
        .sort((a, b) => a.state.position === b.state.position ? b.priority - a.priority : b.state.position - a.state.position);
    }
    return tickets;
  }

  public static getTicketType(ticket: LinearTicket): string {
    return labelMapping[(ticket.labels.nodes[0]?.name ?? "Improvement") as keyof typeof labelMapping];
  }

  public static async selfAssignTicket(ticket: LinearTicket): Promise<void> {
    const assigneeId = await Linear.getMyId();
    if (!assigneeId) {
      return;
    }
    const variables: LinearSelfAssignInput = { input: { assigneeId }, issueUpdateId: ticket.id }
    await Linear.client.mutate({ mutation: SelfAssignIssue, variables })
  }
}
