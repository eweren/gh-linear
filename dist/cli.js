#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const ink_1 = require("ink");
// import meow from 'meow';
const ui_1 = __importDefault(require("./ui"));
// const cli = meow(`
// 	Usage
// 	  $ gh-linear
// 	Options
// 		--name  Your name
// 	Examples
// 	  $ gh-linear --name=Jane
// 	  Hello, Jane
// `, {
// 	flags: {
// 		name: {
// 			type: 'string'
// 		}
// 	}
// });
(0, ink_1.render)(react_1.default.createElement(ui_1.default, null));
// render(<App name={cli.flags.name}/>);
