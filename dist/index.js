import { ToolboxClient } from '@toolbox-sdk/core';
async function getAuthToken() {
    // ... Logic to retrieve ID token (e.g., from local storage, OAuth flow)
    return "AIzaSyDCGLRpaU2ljukJxAF2k4YNt25OZHuD8HI";
}
const URL = "http://127.0.0.1:5000";
const client = new ToolboxClient(URL);
const tool = await client.loadTool("execute_sql");
const result = await tool({ sql: "SELECT * FROM orders;" });
console.log(result);
