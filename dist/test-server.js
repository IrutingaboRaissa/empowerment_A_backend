"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
async function testServer() {
    try {
        console.log('Testing server connection...');
        const response = await (0, node_fetch_1.default)('http://localhost:5000/health');
        const data = await response.json();
        console.log('Server response:', data);
    }
    catch (error) {
        console.error('Error testing server:', error);
    }
}
testServer();
