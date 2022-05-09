"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const react_1 = __importStar(require("react"));
const ink_1 = require("ink");
const ink_text_input_1 = __importDefault(require("ink-text-input"));
const ink_spinner_1 = __importDefault(require("ink-spinner"));
const client_1 = require("@apollo/client");
const context_1 = require("@apollo/client/link/context");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const ink_select_input_1 = __importDefault(require("ink-select-input"));
const ink_task_list_1 = require("ink-task-list");
const cli_spinners_1 = __importDefault(require("cli-spinners"));
const ink_link_1 = __importDefault(require("ink-link"));
// import { execSync } from "child_process";
const httpLink = new client_1.HttpLink({
    fetch: cross_fetch_1.default,
    uri: "https://api.linear.app/graphql",
});
const authLink = (0, context_1.setContext)((_, { headers }) => {
    return {
        headers: {
            ...headers,
            authorization: `Bearer lin_api_fPlz9lhsAK4FtjlnnMEZktXqwokmzKqOtvIg3wl6`
        },
    };
});
exports.client = new client_1.ApolloClient({
    link: authLink.concat(httpLink),
    cache: new client_1.InMemoryCache()
});
const gitBranchCreateSteps = [
    "Creating branch...",
    "Switching to branch...",
    "Pushing branch...",
    "Branch created successfully! You can start Working now",
];
const App = () => {
    const [value, setValue] = (0, react_1.useState)("");
    const [response, setResponse] = (0, react_1.useState)("");
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [gitBranchCreateStep, setGitBranchCreateStep] = (0, react_1.useState)(gitBranchCreateSteps[0]);
    const [creatingBranch, setCreatingBranch] = (0, react_1.useState)(false);
    const [selected, setSelected] = (0, react_1.useState)();
    const [loaded, setLoaded] = (0, react_1.useState)(false);
    const [issues, setIssues] = (0, react_1.useState)([]);
    const [data, setData] = (0, react_1.useState)([]);
    const handleSubmit = async () => {
        var _a;
        setLoading(true);
        const response = await exports.client.query({ query: (0, client_1.gql) `
			query MyIssues($filter: IssueFilter) {
				issues(filter: $filter) {
					nodes {
						id
						title
						number
						priority
						dueDate
						branchName
						state {
							name
							color
							position
						}
						team {
							key
						}
						url
					}
				}
			}
		`, variables: {
                "filter": {
                    "assignee": {
                        "isMe": {
                            "eq": true
                        }
                    },
                    "completedAt": {
                        "null": true
                    }
                }
            } });
        if ((_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.issues) {
            // setValue(JSON.stringify(response.data.issues));
            const is = response.data.issues.nodes.slice().sort((a, b) => a.state.position === b.state.position ? b.priority - a.priority : b.state.position - a.state.position);
            setIssues(response.data.issues.nodes);
            setData(is.map(issue => ({ label: `${issue.url}~~~${issue.team.key}-${`${issue.number}`.padEnd(4)} ${issue.title}~~~${issue.branchName}`, value: issue.id })));
            setLoaded(true);
            setLoading(false);
            return true;
        }
        setLoading(false);
        return false;
    };
    const selectIssue = (item) => {
        var _a;
        setSelected((_a = issues.find(i => i.id === item.value)) === null || _a === void 0 ? void 0 : _a.branchName);
    };
    const handleResponse = (value) => {
        setLoading(true);
        if (value === "Y" || value === "y" || value === "") {
            setCreatingBranch(true);
            // const branchName = selected?.split("~~~")[2];
            setGitBranchCreateStep(gitBranchCreateSteps[1]);
            // setGitBranchCreateStep(execSync(`git ls-remote origin ${selected}`).toString())
            // execSync(`git checkout -b }`);
            setTimeout(() => {
                setTimeout(() => {
                    setGitBranchCreateStep(gitBranchCreateSteps[2]);
                    setTimeout(() => {
                        setGitBranchCreateStep(gitBranchCreateSteps[3]);
                    }, 1000);
                }, 1000);
            }, 1000);
        }
        else if (value === "N" || value === "n") {
            setCreatingBranch(false);
            setSelected(undefined);
            setLoading(false);
        }
    };
    return (react_1.default.createElement(ink_1.Box, { alignItems: 'flex-end', justifyContent: 'flex-start' },
        loading && !creatingBranch && react_1.default.createElement(ink_1.Box, null,
            react_1.default.createElement(ink_spinner_1.default, { type: "arc" }),
            react_1.default.createElement(ink_1.Text, null, "  Loading...")),
        loaded && !selected &&
            react_1.default.createElement(ink_select_input_1.default, { items: data, limit: 5, onSelect: selectIssue, itemComponent: ItemComponent }),
        loading && creatingBranch &&
            react_1.default.createElement(ink_task_list_1.TaskList, null,
                gitBranchCreateStep !== gitBranchCreateSteps[gitBranchCreateSteps.length - 1] && react_1.default.createElement(ink_task_list_1.Task, { label: "Loading", state: "loading", output: gitBranchCreateStep, spinner: cli_spinners_1.default.arc }),
                gitBranchCreateStep === gitBranchCreateSteps[gitBranchCreateSteps.length - 1] && react_1.default.createElement(ink_task_list_1.Task, { label: gitBranchCreateSteps[gitBranchCreateSteps.length - 1], state: "success" })),
        loaded && selected && !loading && gitBranchCreateStep !== gitBranchCreateSteps[gitBranchCreateSteps.length - 1] &&
            react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(ink_1.Text, null,
                    "Start work on: ",
                    react_1.default.createElement(ink_1.Text, { color: "blue" }, selected),
                    " (Y/n)"),
                react_1.default.createElement(ink_text_input_1.default, { value: response, onChange: setResponse, onSubmit: handleResponse })),
        !loaded && !selected && !loading && react_1.default.createElement(ink_1.Box, { marginY: 1 },
            react_1.default.createElement(ink_1.Text, { color: "blue", bold: true }, "Filter for Ticket/Project/Title: "),
            react_1.default.createElement(ink_text_input_1.default, { value: value, placeholder: "(Empty to show all)", onChange: setValue, onSubmit: handleSubmit }))));
};
const ItemComponent = (props) => {
    return react_1.default.createElement(ink_link_1.default, { url: props.label.split("~~~")[0] },
        react_1.default.createElement(ink_1.Text, { color: "blue" }, props.label.split("~~~")[1]));
};
module.exports = App;
exports.default = App;
