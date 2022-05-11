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
const react_1 = __importStar(require("react"));
const ink_1 = require("ink");
const ink_text_input_1 = __importDefault(require("ink-text-input"));
const ink_spinner_1 = __importDefault(require("ink-spinner"));
const client_1 = require("@apollo/client");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const ink_task_list_1 = require("ink-task-list");
const cli_spinners_1 = __importDefault(require("cli-spinners"));
const child_process_1 = require("child_process");
const issueSelection_1 = require("./views/issueSelection");
const configFilePath = "~/.gh/linear/config.yaml";
const gitBranchCreateSteps = {
    check: "Check if branch exists...",
    create: "Creating and switching to branch...",
    switch: "Switching to branch...",
    push: "Pushing branch...",
    draft: "Creating a Draft PR...",
    success: "Branch created successfully! You can start Working now",
};
const App = () => {
    const [value, setValue] = (0, react_1.useState)("");
    const [response, setResponse] = (0, react_1.useState)("");
    const [linearApiToken, setLinearApiToken] = (0, react_1.useState)("");
    const [linearApiTokenPresent, setLinearApiTokenPresent] = (0, react_1.useState)(false);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [isGitRepo, setIsGitRepo] = (0, react_1.useState)(false);
    const [gitBranchCreateStep, setGitBranchCreateStep] = (0, react_1.useState)(gitBranchCreateSteps.check);
    const [creatingBranch, setCreatingBranch] = (0, react_1.useState)(false);
    const [selected, setSelected] = (0, react_1.useState)();
    const [loaded, setLoaded] = (0, react_1.useState)(false);
    const [issues, setIssues] = (0, react_1.useState)([]);
    const [data, setData] = (0, react_1.useState)([]);
    const [filterForMyIssues, setFilterForMyIssues] = (0, react_1.useState)(false);
    const [appheight, setHeight] = (0, react_1.useState)(50);
    (0, react_1.useEffect)(() => {
        if (!linearApiToken) {
            return;
        }
        setFilterForMyIssues(false);
    }, [linearApiToken]);
    (0, react_1.useEffect)(() => {
        const intervalStatusCheck = setInterval(() => {
            setHeight(process.stdout.rows);
        }, 1000);
        setHeight(process.stdout.rows);
        if ((0, child_process_1.execSync)('git -C . rev-parse 2>/dev/null; echo $?').toString().trim() === "0") {
            setIsGitRepo(true);
        }
        else {
            setIsGitRepo(false);
        }
        return () => {
            clearInterval(intervalStatusCheck);
        };
    }, []);
    const handleSubmit = async () => {
        var _a;
        setLoading(true);
        const httpLink = new client_1.HttpLink({
            fetch: cross_fetch_1.default,
            uri: "https://api.linear.app/graphql",
            headers: {
                authorization: `Bearer ${linearApiToken.trim()}`
            }
        });
        const client = new client_1.ApolloClient({
            link: httpLink,
            cache: new client_1.InMemoryCache()
        });
        const response = await client.query({ query: (0, client_1.gql) `
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
						url
						integrationResources {
							nodes {
								pullRequest {
									url
								}
							}
						}
					}
				}
			}
		`, variables: {
                "filter": {
                    "state": {
                        "type": {
                            "neq": "canceled"
                        }
                    },
                    "assignee": {
                        "isMe": {
                            "eq": filterForMyIssues
                        }
                    },
                    "completedAt": {
                        "null": true
                    }
                },
                first: 50
            } });
        if ((_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.issues) {
            let is = response.data.issues.nodes.slice().filter(n => n.branchName.includes(value.toLowerCase()));
            if (is.length === 0) {
                is = response.data.issues.nodes.slice();
            }
            is = is.sort((a, b) => a.state.position === b.state.position ? b.priority - a.priority : b.state.position - a.state.position);
            setIssues(is);
            setData(is.map(issue => ({ label: JSON.stringify(issue), value: issue.id })));
            setLoaded(true);
            setLoading(false);
            return true;
        }
        setLoading(false);
        return false;
    };
    (0, react_1.useEffect)(() => {
        try {
            const token = (0, child_process_1.execSync)(`cat ${configFilePath}`).toString();
            setLinearApiToken(token);
            setLinearApiTokenPresent(true);
        }
        catch (e) {
            let previousPath = "";
            configFilePath.split("/").forEach((path) => {
                if (path !== "config.yaml" && path !== "~") {
                    previousPath += path + "/";
                    (0, child_process_1.execSync)(`mkdir ~/${previousPath}`).toString();
                }
            });
            setLinearApiTokenPresent(false);
        }
    }, []);
    const selectIssue = (item) => {
        var _a;
        setSelected((_a = issues.find(i => i.id === item.value)) === null || _a === void 0 ? void 0 : _a.branchName);
    };
    const handleResponse = (value) => {
        setLoading(true);
        if (value === "Y" || value === "y" || value === "") {
            setCreatingBranch(true);
            setGitBranchCreateStep(gitBranchCreateSteps.check);
            const remoteBranchExists = (0, child_process_1.execSync)(`git ls-remote origin ${selected}`).toString();
            if (remoteBranchExists) {
                setGitBranchCreateStep(gitBranchCreateSteps.switch);
                (0, child_process_1.execSync)(`git checkout ${selected}`);
            }
            else {
                setGitBranchCreateStep(gitBranchCreateSteps.create);
                (0, child_process_1.execSync)(`git checkout -b ${selected}`);
                setGitBranchCreateStep(gitBranchCreateSteps.push);
                (0, child_process_1.execSync)(`git push --set-upstream origin ${selected}`);
            }
            setGitBranchCreateStep(gitBranchCreateSteps.success);
        }
        else if (value === "N" || value === "n") {
            setCreatingBranch(false);
            setSelected(undefined);
            setResponse("");
        }
        setLoading(false);
    };
    const saveLinearToken = (value) => {
        (0, child_process_1.execSync)(`echo ${value} > ${configFilePath}`);
        setLinearApiTokenPresent(true);
    };
    if (!isGitRepo) {
        return react_1.default.createElement(ink_1.Box, { marginY: 1, flexDirection: 'column' },
            react_1.default.createElement(ink_1.Text, { color: "magentaBright", bold: true }, "This command can only be executed from a git directory."));
    }
    if (!linearApiTokenPresent) {
        return react_1.default.createElement(ink_1.Box, { marginY: 1, flexDirection: 'column' },
            react_1.default.createElement(ink_1.Text, { color: "blue", bold: true }, "Please provide your Linear API token."),
            react_1.default.createElement(ink_1.Text, { color: "gray" }, "The token will only be saved locally."),
            react_1.default.createElement(ink_text_input_1.default, { value: linearApiToken, placeholder: "lin_api_...", onChange: setLinearApiToken, onSubmit: saveLinearToken }));
    }
    if (loaded && !selected) {
        return react_1.default.createElement(issueSelection_1.IssueSelection, { data: data, onSelect: selectIssue });
    }
    return (react_1.default.createElement(ink_1.Box, { height: appheight, alignItems: 'flex-start', justifyContent: 'flex-start' },
        loading && !creatingBranch && react_1.default.createElement(ink_1.Box, null,
            react_1.default.createElement(ink_spinner_1.default, { type: "arc" }),
            react_1.default.createElement(ink_1.Text, null, "  Loading...")),
        loading && creatingBranch &&
            react_1.default.createElement(ink_task_list_1.TaskList, null,
                gitBranchCreateStep !== gitBranchCreateSteps.success && react_1.default.createElement(ink_task_list_1.Task, { label: "Loading", state: "loading", output: gitBranchCreateStep, spinner: cli_spinners_1.default.arc }),
                gitBranchCreateStep === gitBranchCreateSteps.success && react_1.default.createElement(ink_task_list_1.Task, { label: gitBranchCreateSteps.success, state: "success" })),
        loaded && selected && !loading && gitBranchCreateStep !== gitBranchCreateSteps.success &&
            react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(ink_1.Text, null,
                    "Start work on: ",
                    react_1.default.createElement(ink_1.Text, { color: "blue" }, selected),
                    " (Y/n) "),
                react_1.default.createElement(ink_text_input_1.default, { value: response, onChange: setResponse, onSubmit: handleResponse })),
        !loaded && !selected && !loading && react_1.default.createElement(ink_1.Box, { marginY: 1 },
            react_1.default.createElement(ink_1.Text, { color: "blue", bold: true }, "Filter for Ticket/Project/Title: "),
            react_1.default.createElement(ink_text_input_1.default, { value: value, placeholder: "(Empty to show all)", onChange: setValue, onSubmit: handleSubmit }))));
};
module.exports = App;
exports.default = App;
