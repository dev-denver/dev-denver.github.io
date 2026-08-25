import ChatBubble from "@/shortcodes/ChatBubble";
import React from "react";

function Me({
  name = "나",
  children,
}: {
  name?: string;
  children: React.ReactNode;
}) {
  return (
    <ChatBubble from="me" name={name}>
      {children}
    </ChatBubble>
  );
}

export default Me;
