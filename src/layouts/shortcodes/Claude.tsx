import ChatBubble from "@/shortcodes/ChatBubble";
import React from "react";

function Claude({
  name = "Claude",
  children,
}: {
  name?: string;
  children: React.ReactNode;
}) {
  return (
    <ChatBubble from="claude" name={name}>
      {children}
    </ChatBubble>
  );
}

export default Claude;
