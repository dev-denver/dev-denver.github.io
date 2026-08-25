import React from "react";

function ChatBubble({
  from,
  name,
  children,
}: {
  from: "me" | "claude";
  name: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`chat-turn chat-turn--${from}`}>
      <span className="chat-name">{name}</span>
      <div className="chat-bubble">{children}</div>
    </div>
  );
}

export default ChatBubble;
