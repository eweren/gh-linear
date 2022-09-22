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