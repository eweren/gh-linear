"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemComponent = void 0;
const react_1 = __importDefault(require("react"));
const ink_1 = require("ink");
const chalk_1 = __importDefault(require("chalk"));
const ItemComponent = (props) => {
    var _a, _b;
    const { team, title, number, state, dueDate } = JSON.parse(props.label);
    const status = state.type;
    return (react_1.default.createElement(ink_1.Box, { flexDirection: "row" },
        react_1.default.createElement(ink_1.Text, { italic: true, color: "white" },
            team.key,
            "-",
            number.toFixed().padEnd(7)),
        react_1.default.createElement(ink_1.Text, { bold: true },
            react_1.default.createElement(ink_1.Transform, { transform: chalk_1.default.hex((_a = state.color) !== null && _a !== void 0 ? _a : "#FFF") },
                status === "backlog" && '◌ ',
                status === "unstarted" && '◯ ',
                status === "started" && '◑ ',
                status === "canceled" && '⌀ ',
                state.name ? (state.name.length >= 20 ? state.name.slice(0, 15) + "..." : state.name).padEnd(20) : "")),
        react_1.default.createElement(ink_1.Text, { italic: true, color: "white" }, title),
        dueDate !== "null" && react_1.default.createElement(ink_1.Box, { marginLeft: 1 },
            react_1.default.createElement(ink_1.Text, null,
                react_1.default.createElement(ink_1.Transform, { transform: chalk_1.default.hex((_b = state.color) !== null && _b !== void 0 ? _b : "#FFF") }, dueDate)))));
};
exports.ItemComponent = ItemComponent;
