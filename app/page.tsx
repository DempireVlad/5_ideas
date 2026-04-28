"use client";
import { useState } from "react";

type Idea = {
  title: string;
  description: string;
};

export default function Home() {
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("business");
  const [results, setResults] = useState<Idea[]>([]); 
  const [loading, setLoading] = useState(false);

  const generateIdeas = async () => {
    if (!topic) return;
    setLoading(true);
    setResults([]); // Clear previous results before new generation

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, category }),
      });

      const data = await response.json();

      if (!response.ok) {
        // if server returned an error, show it
        throw new Error(data.error || "Server Error");
      }

      if (data.text) {
        const parsedData = JSON.parse(data.text);
        setResults(parsedData.ideas || []);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Server Error";
      console.error("Frontend Error:", error);
      alert("An error occurred: " + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-zinc-950 text-white flex flex-col items-center">
      <div className="max-w-2xl w-full space-y-8">
       
        <h1 className="text-5xl font-extrabold text-center mb-10 tracking-tight">
          Top 5 Ideas For <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-purple-500">
            {topic || "Any Topic"}
          </span>
        </h1>

        <div className="flex flex-col gap-4">
          <input
            className="p-3 rounded bg-zinc-900 border border-zinc-800"
            placeholder="Enter a topic (e.g., mobile app)"
            onChange={(e) => setTopic(e.target.value)}
          />
          <select
            className="p-3 rounded bg-zinc-900 border border-zinc-800"
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="business">Business</option>
            <option value="content">Video Content</option>
            <option value="personal">Personal Life</option>
          </select>
          <button
            onClick={generateIdeas}
            disabled={loading}
            className="bg-blue-600 p-3 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Get 5 Ideas"}
          </button>
        </div>

        {/* Display results */}
        <div className="grid gap-4 mt-8">
          {results.map((idea, index) => (
            <div
              key={index}
              className="p-4 rounded bg-zinc-900 border border-zinc-800"
            >
              <h3 className="font-bold text-blue-400">{idea.title}</h3>
              <p className="text-sm text-zinc-400">{idea.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
