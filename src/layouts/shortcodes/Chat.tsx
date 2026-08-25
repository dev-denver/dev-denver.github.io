import React from "react";

function Chat({ children }: { children: React.ReactNode }) {
  return <div className="chat not-prose">{children}</div>;
}

export default Chat;
