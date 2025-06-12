import React, { useState, useEffect, useRef } from "react";
import { Input, Button, Typography, Space, List, Card } from "antd";

const { Text } = Typography;
const { TextArea } = Input;

export default function ChatArea({ user, chatUser, messages, users, participants = [], onSendMessage }) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const isBroadcast = chatUser?.type === "broadcast";
  const isAdmin = chatUser?.createdBy === user.id;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const allUsers = [...users, ...participants];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div
        style={{
          padding: "12px",
          borderBottom: "1px solid #eee",
          background: "#f0f2f5",
        }}
      >
        <Text strong>{chatUser?.name || "Select a chat"}</Text>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {messages.length === 0 ? (
          <Text type="secondary">No messages yet</Text>
        ) : (
          <List
            dataSource={messages}
            renderItem={({ id, senderId, text, time }) => {
              const sender = allUsers.find((u) => u.id === senderId);
              const isCurrentUser = senderId === user.id;

              return (
                <List.Item
                  key={id}
                  style={{
                    justifyContent: isCurrentUser ? "flex-end" : "flex-start",
                    display: "flex",
                  }}
                >
                  <div
                    style={{
                      background: isCurrentUser ? "#007bff" : "#f0f0f0",
                      color: isCurrentUser ? "white" : "black",
                      padding: "10px 14px",
                      borderRadius: "12px",
                      maxWidth: "60%",
                    }}
                  >
                    {!isCurrentUser && (
                      <Text strong style={{ display: "block", marginBottom: 4 }}>
                        {sender?.name || "Unknown"}
                      </Text>
                    )}
                    <div>{text}</div>
                    <Text
                      type="secondary"
                      style={{ fontSize: "10px", display: "block", marginTop: 4 }}
                    >
                      {time}
                    </Text>
                  </div>
                </List.Item>
              );
            }}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
{(!isBroadcast || isAdmin) && (
  <form
    onSubmit={handleSubmit}
    style={{
      padding: "12px",
      borderTop: "1px solid #eee",
      background: "#fff",
    }}
  >
    <div
      style={{
        display: "flex",
        gap: 8,
        width: "100%",
      }}
    >
      <TextArea
        autoSize={{ minRows: 1, maxRows: 3 }}
        placeholder="Type a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        style={{
          borderRadius: "20px",
          flex: 1,
          resize: "none", // optional: disables manual resizing
        }}
      />
      <Button type="primary" htmlType="submit" shape="round">
        Send
      </Button>
    </div>
  </form>
)}


      {isBroadcast && !isAdmin && (
        <div
          style={{
            textAlign: "center",
            padding: 10,
            color: "#888",
            fontStyle: "italic",
            background: "#fff",
          }}
        >
          Only the admin can send messages in this broadcast group.
        </div>
      )}
    </div>
  );
}
