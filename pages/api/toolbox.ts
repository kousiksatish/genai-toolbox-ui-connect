
import { NextApiRequest, NextApiResponse } from 'next';
import { ToolboxClient } from '@toolbox-sdk/core';

const URL = "http://127.0.0.1:5000"
const client = new ToolboxClient(URL)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { tool: toolName } = req.query;

    if (typeof toolName !== 'string') {
      return res.status(400).json({ error: 'Tool name must be a string' });
    }

    const tool = await client.loadTool(toolName);
    let result;

    if (toolName === 'execute_sql') {
      if (req.method === 'POST') {
        const { sql } = req.body;
        result = await tool({sql: sql});
      } else {
        return res.status(405).json({ error: 'Method Not Allowed for execute_sql. Use POST.' });
      }
    } else {
        result = await tool();
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to execute tool' });
  }
}
