import { getStore } from "@netlify/blobs";

interface LeaderboardEntry {
  username: string;
  score: number;
  date: string;
}

interface DailyLeaderboardEntry {
  username: string;
  daysWon: number;
  daysLost: number;
  totalGuessesForWins: number;
  averageGuesses: number;
  lastSubmittedDate: string; // YYYY-MM-DD
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
  const gameMode = url.searchParams.get("gameMode"); // "nba", "nfl", or "nba-daily"
  const difficulty = url.searchParams.get("difficulty"); // "easy", "medium", "hard", or "daily"

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
      
      if (gameMode === "nba-daily") {
        const { username, isWin, guesses, clientDate } = body;

        if (!username || typeof isWin !== "boolean" || (isWin && typeof guesses !== "number") || !clientDate) {
          return new Response(JSON.stringify({ error: "Invalid daily leaderboard submission payload." }), {
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
        let scores: DailyLeaderboardEntry[] = (await store.get(key, { type: "json" })) || [];

        const existingUserIndex = scores.findIndex(
          (entry) => entry.username.toLowerCase() === cleanUsername.toLowerCase()
        );

        if (existingUserIndex !== -1) {
          const entry = scores[existingUserIndex];
          
          // Prevent double submission for the same date
          if (entry.lastSubmittedDate === clientDate) {
            return new Response(JSON.stringify({ error: "Already submitted today's score." }), {
              status: 400,
              headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
              },
            });
          }

          // Update existing user entry
          if (isWin) {
            entry.daysWon += 1;
            entry.totalGuessesForWins += guesses;
            entry.averageGuesses = Number((entry.totalGuessesForWins / entry.daysWon).toFixed(2));
          } else {
            entry.daysLost += 1;
          }
          entry.lastSubmittedDate = clientDate;
          entry.date = new Date().toISOString();
        } else {
          // Create new user entry
          const daysWon = isWin ? 1 : 0;
          const daysLost = isWin ? 0 : 1;
          const totalGuessesForWins = isWin ? guesses : 0;
          const averageGuesses = isWin ? guesses : 0;

          scores.push({
            username: cleanUsername,
            daysWon,
            daysLost,
            totalGuessesForWins,
            averageGuesses: Number(averageGuesses.toFixed(2)),
            lastSubmittedDate: clientDate,
            date: new Date().toISOString()
          });
        }

        // Sort Daily Leaderboard:
        // 1. daysWon descending
        // 2. averageGuesses ascending (only count users who have won at least 1 day, else push to bottom)
        // 3. daysLost ascending
        // 4. date ascending (earlier update first)
        scores.sort((a, b) => {
          if (b.daysWon !== a.daysWon) {
            return b.daysWon - a.daysWon;
          }
          const aAvg = a.daysWon > 0 ? a.averageGuesses : Infinity;
          const bAvg = b.daysWon > 0 ? b.averageGuesses : Infinity;
          if (aAvg !== bAvg) {
            return aAvg - bAvg;
          }
          if (a.daysLost !== b.daysLost) {
            return a.daysLost - b.daysLost;
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
      } else {
        // Classic mode leaderboard submission
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
      }
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
