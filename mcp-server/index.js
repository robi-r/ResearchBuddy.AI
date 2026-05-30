import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load configuration variables from .env
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Check and output bootstrap warning signs to stderr without corrupting stdout
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("[INFO | MCP] SUPABASE_URL or SUPABASE_ANON_KEY not set. Operating with fallback mocks.");
}
if (!OPENAI_API_KEY) {
  console.error("[INFO | MCP] OPENAI_API_KEY is not defined. Vector embedding conversion requires this key.");
}

// Initialise client wrappers safely
const supabase = createClient(
  SUPABASE_URL || "https://placeholder-url.supabase.co", 
  SUPABASE_ANON_KEY || "placeholder-anon-key"
);

// Instantiate our formal Model Context Protocol Server
const server = new Server(
  {
    name: "researchbuddy-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register list of tools to announce to the client
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "find_collaborators",
        description: "Translate an unstructured user research intent query into vector embeddings via OpenAI, then search Supabase using pgvector search to locate matches.",
        inputSchema: {
          type: "object",
          properties: {
            intent: {
              type: "string",
              description: "The research interests, topic, field or thesis statement (e.g., neural interfaces in neurosurgery).",
            },
            limit: {
              type: "number",
              description: "Optional maximum size of items to query (defaults to 5).",
            }
          },
          required: ["intent"]
        }
      },
      {
        name: "get_active_collabs",
        description: "Get current collaborative connections from the matched pairs index (Max 2 items) for a given researcher.",
        inputSchema: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              description: "The unique UUID identifier of the target researcher.",
            }
          },
          required: ["userId"]
        }
      }
    ]
  };
});

// Helper to convert plain intent text to high-fidelity float vectors using OpenAI
async function getOpenAIEmbedding(text) {
  if (!OPENAI_API_KEY) {
    throw new Error("Cannot get embedding: OPENAI_API_KEY environment variable is blank.");
  }

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI HTTP ${response.status} Error: ${errorBody}`);
  }

  const payload = await response.json();
  if (!payload.data || !payload.data[0] || !payload.data[0].embedding) {
    throw new Error("Received an unexpected data format layout from OpenAI embeddings API.");
  }

  return payload.data[0].embedding;
}

// Register dynamic tool caller resolver
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "find_collaborators") {
      const { intent, limit = 5 } = args;
      if (!intent || typeof intent !== "string") {
        return {
          content: [{ type: "text", text: "Error: The 'intent' parameter is missing or structured incorrectly." }],
          isError: true
        };
      }

      console.error(`[MCP DBG] Converting research intent text into vector coordinates...`);
      const embedding = await getOpenAIEmbedding(intent);

      console.error(`[MCP DBG] Querying match_collaborators pgvector similarity algorithm...`);
      const { data: collaborators, error } = await supabase.rpc("match_collaborators", {
        query_embedding: embedding,
        match_threshold: 0.15, // standard lower semantic threshold
        match_count: limit
      });

      if (error) {
        console.error(`[MCP ERR] Supabase RPC match_collaborators error:`, error);
        return {
          content: [{ type: "text", text: `Supabase matching function returned an error: ${error.message}` }],
          isError: true
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(collaborators || [], null, 2)
          }
        ]
      };
    }

    if (name === "get_active_collabs") {
      const { userId } = args;
      if (!userId || typeof userId !== "string") {
        return {
          content: [{ type: "text", text: "Error: The 'userId' parameter must be a valid string." }],
          isError: true
        };
      }

      console.error(`[MCP DBG] Searching active records inside matches registry for user: ${userId}`);

      // Querying with multi-column alignment to deal with different table naming schema options natively
      const { data: matches, error } = await supabase
        .from("matches")
        .select("*")
        .or(`user_id.eq.${userId},candidate_id.eq.${userId},user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq("status", "accepted")
        .limit(2);

      if (error) {
        console.error(`[MCP ERR] Supabase retrieval error:`, error);
        return {
          content: [{ type: "text", text: `Supabase matches query returned an error: ${error.message}` }],
          isError: true
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(matches || [], null, 2)
          }
        ]
      };
    }

    return {
      content: [{ type: "text", text: `Error: The tool name '${name}' was not recognized by this MCP server.` }],
      isError: true
    };

  } catch (error) {
    console.error(`[MCP EXPORT EXCEPTION] Error handling tool call to '${name}':`, error);
    return {
      content: [{ type: "text", text: `Internal Server Error: ${error.message}` }],
      isError: true
    };
  }
});

// Boot main stdio listener loop
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[MCP SUCCESS] ResearchBuddy MCP Server running on stdio channel.");
}

main().catch((err) => {
  console.error("[MCP CRITICAL] Fatal runtime crash during bootstrapping:", err);
  process.exit(1);
});
