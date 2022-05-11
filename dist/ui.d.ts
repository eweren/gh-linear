import { FC } from 'react';
export declare type StatusType = "backlog" | "unstarted" | "started" | "canceled";
export declare type LinearTicket = {
    id: string;
    title: string;
    url: string;
    number: number;
    priority: number;
    dueDate: any;
    branchName: string;
    state: {
        name: string;
        type: StatusType;
        color: string;
        position: number;
    };
    integrationResources: {
        nodes: {
            pullRequest: {
                url: string;
            };
        }[];
    };
    team: {
        key: string;
    };
};
declare const App: FC;
export default App;
