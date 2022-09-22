export type StatusType = "backlog" | "unstarted" | "started" | "canceled";

export type LinearTicket = {
  id: string,
  title: string,
  url: string,
  number: number,
  priority: number,
  dueDate: any,
  branchName: string,
  state: {
    name: string,
    type: StatusType,
    color: string,
    position: number
  },
  integrationResources: {
    nodes: {
      pullRequest: {
        url: string
      }
    }[]
  },
  labels: {
    nodes: {
      name: string
    }[]
  }
  team: {
    key: string
  }
}

export type Config = { linearToken: null | string, defaultBranch: string };

export type LinearSearchQuery = {
  filter: {
    assignee?: { isMe?: { eq?: boolean } }, or?: {
      title?: {
        contains?: string
      },
      team?: {
        key?: {
          eq?: string
        }
      },
      number?: {
        eq?: number
      }
    }, and?: {
      team?: {
        key?: {
          eq?: string
        }
      },
      number?: {
        eq?: number
      }
    }, state?: { type?: { neq?: string } }, completedAt?: { null: true }, team?: { key?: { eq?: string } }
  }, first: number
};

export type ValueOf<T> = T[keyof T];

export interface Arguments {
  ticket?: String;
  search?: String;
  my?: boolean;
  help?: boolean;
}