import { useState } from "react";
import "./App.css";

interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
    index: number;
  }>;
}

export default function App() {
  const apiKey = import.meta.env.VITE_CHATGPT_API_KEY;

  const [response, setResponse] = useState<string | null>(null);
  const [responseHistory, setResponseHistory] = useState<ChatResponse[]>([]); // History of full responses
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const callChatGPT = async (message: string) => {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: message }],
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data.choices[0].message.content);

        setResponseHistory((prevHistory) => [...prevHistory, data]);

        console.log(data);
      } else {
        setErrorMessage(data.error.message);
        console.error("Error:", data.error.message);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
        console.error("Error:", error.message);
      } else {
        setErrorMessage("An unknown error occurred");
        console.error("Unknown error:", error);
      }
    }
  };

  return (
    <>
      <header>
        <h1>ChatGPT Wrapper</h1>
      </header>

      <div className="body">
        <div className="column">col1</div>
        <div className="column">
          <h3>Chat</h3>
          <h5>Response:</h5>
          <div>{response}</div>
          <button onClick={() => callChatGPT("Write a haiku about pokemon")}>
            Call API
          </button>
        </div>
        <div className="column">
          <h3>Inspect</h3>
          <pre>{JSON.stringify(responseHistory, null, 2)}</pre>
        </div>
      </div>

      <footer>
        <p>kthx</p>
      </footer>
    </>
  );
}
