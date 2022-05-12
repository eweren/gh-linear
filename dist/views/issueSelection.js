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
exports.IssueSelection = void 0;
const build_1 = __importDefault(require("ink-select-input/build"));
const react_1 = __importStar(require("react"));
const ink_1 = require("ink");
const selectionListItem_1 = require("../components/selectionListItem");
const useFullHeight_1 = require("../hooks/useFullHeight");
const child_process_1 = require("child_process");
/** use the label in the following form: url~~~title~~~branchName~~colorCode~~~state~~~dueDate */
const IssueSelection = (props) => {
    var _a, _b, _c, _d;
    const fullHeight = (0, useFullHeight_1.useFullHeight)();
    const { exit } = (0, ink_1.useApp)();
    // const [issues] = useState(props.data.map((d) => JSON.parse(d.label)) as unknown as LinearTicket);
    const [highlightedItem, setHighlightedItem] = (0, react_1.useState)();
    const [selectedItem, setSelectedItem] = (0, react_1.useState)();
    (0, react_1.useEffect)(() => {
        setHighlightedItem(props.data[0]);
    }, [props.data]);
    (0, react_1.useEffect)(() => {
        if (highlightedItem === null || highlightedItem === void 0 ? void 0 : highlightedItem.label) {
            setSelectedItem(JSON.parse(highlightedItem.label));
        }
        else {
            setSelectedItem(undefined);
        }
    }, [highlightedItem]);
    (0, ink_1.useInput)((input, key) => {
        var _a, _b, _c, _d, _e, _f;
        if (!highlightedItem) {
            return;
        }
        const selectedItem = JSON.parse(highlightedItem.label);
        if (input === 'S' || input === "s") {
            (_a = props.onSelect) === null || _a === void 0 ? void 0 : _a.call(props, highlightedItem);
        }
        else if (input === "V" || input === "v") {
            (0, child_process_1.execSync)(`open ${selectedItem.url}`);
        }
        else if ((input === "P" || input === "p") && ((_e = (_d = (_c = (_b = selectedItem === null || selectedItem === void 0 ? void 0 : selectedItem.integrationResources) === null || _b === void 0 ? void 0 : _b.nodes) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.pullRequest) === null || _e === void 0 ? void 0 : _e.url)) {
            (0, child_process_1.execSync)(`open ${selectedItem.integrationResources.nodes[0].pullRequest.url}`);
        }
        else if (input === "F" || input === "f") {
            (_f = props.onAbort) === null || _f === void 0 ? void 0 : _f.call(props);
        }
        else if (input === "Q" || input === "q") {
            exit();
            return;
        }
        if (key.leftArrow) {
            // Left arrow key pressed
        }
    });
    return (react_1.default.createElement(ink_1.Box, { flexDirection: 'column' },
        react_1.default.createElement(ink_1.Box, { flexDirection: 'row', justifyContent: 'space-between', borderStyle: 'round', marginRight: 5 },
            react_1.default.createElement(ink_1.Box, { flexDirection: 'row' },
                react_1.default.createElement(ink_1.Text, { color: "green" }, "  ID".padEnd(12)),
                react_1.default.createElement(ink_1.Text, { color: "green" }, "Status".padEnd(22)),
                react_1.default.createElement(ink_1.Text, { color: "green" }, "Title")),
            react_1.default.createElement(ink_1.Text, { color: "green" }, "Due Date".padEnd(16))),
        react_1.default.createElement(build_1.default, { items: props.data, limit: fullHeight - 6, onHighlight: setHighlightedItem, onSelect: props.onSelect, itemComponent: selectionListItem_1.ItemComponent }),
        react_1.default.createElement(ink_1.Box, { flexDirection: 'row', marginTop: Math.max(0, fullHeight - 6 - props.data.length), marginRight: 5, justifyContent: 'space-between', borderStyle: 'round' },
            react_1.default.createElement(ink_1.Box, { flexDirection: 'row', paddingLeft: 2 },
                react_1.default.createElement(ink_1.Text, { color: "green" }, "(S) to start working  "),
                react_1.default.createElement(ink_1.Text, { color: "blue" }, "(V) to view in browser  "),
                react_1.default.createElement(ink_1.Text, { color: "yellow" }, "(F) to search again  "),
                ((_d = (_c = (_b = (_a = selectedItem === null || selectedItem === void 0 ? void 0 : selectedItem.integrationResources) === null || _a === void 0 ? void 0 : _a.nodes) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.pullRequest) === null || _d === void 0 ? void 0 : _d.url) && react_1.default.createElement(ink_1.Text, { color: "magenta" }, "(P) to show PR  ")),
            react_1.default.createElement(ink_1.Text, { color: "grey" }, "(Q) to quit  "))));
};
exports.IssueSelection = IssueSelection;
