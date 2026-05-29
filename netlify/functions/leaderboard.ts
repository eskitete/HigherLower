import { getStore } from "@netlify/blobs";

interface LeaderboardEntry {
  username: string;
  score: number;
  date: string;
}

export default async (req: Request) => {
  // Handle CORS options preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
    });
  }

  const url = new URL(req.url);
  const gameMode = url.searchParams.get("gameMode"); // "nba" or "nfl"
  const difficulty = url.searchParams.get("difficulty"); // "easy", "medium", "hard"

  if (!gameMode || !difficulty) {
    return new Response(JSON.stringify({ error: "Missing gameMode or difficulty query parameter." }), {
      status: 400,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
    });
  }

  const key = `${gameMode}_${difficulty}`;
  const store = getStore({ name: "leaderboards" });

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { username, score } = body;

      if (!username || typeof score !== "number" || score < 0) {
        return new Response(JSON.stringify({ error: "Invalid username or score." }), {
          status: 400,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          },
        });
      }

      const cleanUsername = username.trim().substring(0, 20);
      if (!cleanUsername) {
        return new Response(JSON.stringify({ error: "Username cannot be empty." }), {
          status: 400,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          },
        });
      }

      // Fetch existing scores
      let scores: LeaderboardEntry[] = (await store.get(key, { type: "json" })) || [];

      // Check if this username already has a higher or equal score
      const existingUserIndex = scores.findIndex(
        (entry) => entry.username.toLowerCase() === cleanUsername.toLowerCase()
      );

      if (existingUserIndex !== -1) {
        // If new score is higher, update it; otherwise keep the higher score
        if (score > scores[existingUserIndex].score) {
          scores[existingUserIndex].score = score;
          scores[existingUserIndex].date = new Date().toISOString();
        }
      } else {
        // Add new entry
        scores.push({
          username: cleanUsername,
          score,
          date: new Date().toISOString(),
        });
      }

      // Sort: descending by score, and then ascending by date (if tied)
      scores.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      // Limit to top 100
      scores = scores.slice(0, 100);

      // Save back to blob store
      await store.setJSON(key, scores);

      return new Response(JSON.stringify({ success: true, scores }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
      });
    }
  }

  // Handle GET request to retrieve scores
  try {
    const scores: LeaderboardEntry[] = (await store.get(key, { type: "json" })) || [];
    return new Response(JSON.stringify(scores), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
    });
  }
};
