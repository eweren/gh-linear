"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFullHeight = void 0;
const react_1 = require("react");
const useFullHeight = () => {
    const [height, setHeight] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        const intervalStatusCheck = setInterval(() => {
            setHeight(process.stdout.rows);
        }, 1000);
        setHeight(process.stdout.rows);
        return () => clearInterval(intervalStatusCheck);
    }, []);
    return height;
};
exports.useFullHeight = useFullHeight;
