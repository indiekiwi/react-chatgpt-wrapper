import { useState } from "react";
import "./App.css";

const FLAGS = {
  is_failure: 1,
};

interface ChatResponse {
  id: string;
  message: string;
  prompt: string;
  tokens: {
    prompt: number;
    reply: number;
  };
  flags: number;
}

export default function App() {
  const apiKey = import.meta.env.VITE_CHATGPT_API_KEY;

  const [inputMessage, setInputMessage] = useState("");
  const [responseHistory, setResponseHistory] = useState<ChatResponse[]>([]);

  const callChatGPT = async (e: React.FormEvent) => {
    e.preventDefault();

    const timestamp = Date.now().toString();

    const chatResponse: ChatResponse = {
      id: timestamp,
      message: "",
      prompt: inputMessage,
      tokens: {
        prompt: 0,
        reply: 0,
      },
      flags: 0,
    };

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", //@todo make dropdown
          messages: [{ role: "user", content: inputMessage }],
        }),
      });

      const data = await res.json();

      if (res.ok) {
        chatResponse.message = data.choices[0].message.content;
        chatResponse.tokens.prompt = data.usage.prompt_tokens;
        chatResponse.tokens.reply = data.usage.completion_tokens;
      } else {
        chatResponse.message = `Error: ${data.error.message}`;
        chatResponse.flags |= FLAGS.is_failure;
      }

      setResponseHistory((prevHistory) => [...prevHistory, chatResponse]);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      chatResponse.message = `Error: ${errorMessage}`;
      chatResponse.flags |= FLAGS.is_failure;
      setResponseHistory((prevHistory) => [...prevHistory, chatResponse]);
    }

    setInputMessage("");
  };

  return (
    <>
      <header>
        <h1>ChatGPT Wrapper</h1>
      </header>

      <div className="body">
        <div className="column">
          <h3>Threads</h3>
          <p>@todo</p>
        </div>
        <div className="column">
          <h3>Chat</h3>
          <div id="chatFocus">
            <ul>
              {responseHistory.map((record, index) => (
                <li key={index}>
                  <strong>Q: </strong>
                  {record.prompt}
                  <br />
                  <strong>A: </strong>
                  {record.message} <br />
                  <small>
                    <strong>Created: </strong>
                    {new Date(parseInt(record.id))
                      .toISOString()
                      .replace("T", " ")
                      .substring(0, 19)}{" "}
                    |<strong> Tokens: </strong>
                    {record.tokens.prompt} + {record.tokens.reply} |{" "}
                    <strong> Flags: </strong>
                    {record.flags & FLAGS.is_failure ? "Failure" : "Success"}
                  </small>
                </li>
              ))}
            </ul>
          </div>
          <form onSubmit={callChatGPT}>
            <textarea
              id="message"
              name="message"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              required
            />
            <button type="submit">Send</button>
          </form>
        </div>
        <div className="column">
          <h3>Configure</h3>
          <p></p>
        </div>
      </div>

      <footer>
        <p>kthx</p>
      </footer>
    </>
  );
}
