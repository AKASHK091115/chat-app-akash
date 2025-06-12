import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import ChatArea from "../components/chatarea";
import axios from "axios";
import { useSocket } from "../hooks/useSocket";
import { Layout, Button } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

const { Sider, Content, Header } = Layout;

export default function ChatDashboard({ user, token, onLogout, usersInTheChat }) {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedChat, setSelectedChat] = useState({ type: "user", id: null });
  const [messages, setMessages] = useState({});
  const [chatParticipants, setChatParticipants] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);


  const handleToggleSidebar = () => {
    setShowSidebar((prev) => !prev);
  };

  const { connected, authError, sendPrivateMessage, sendGroupMessage } = useSocket(
    token,
    (msg) => {
      const isGroup = !!msg.groupId;
      const chatId = isGroup ? msg.groupId : msg.fromUserId;

      setMessages((prev) => {
        const chatMessages = prev[chatId] || [];
        const pendingIndex = chatMessages.findIndex(
          (m) => m.pending && m.text === msg.message
        );
        const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        if (pendingIndex !== -1) {
          const newMessages = [...chatMessages];
          newMessages[pendingIndex] = {
            id: msg.id,
            senderId: msg.fromUserId,
            text: msg.message,
            time: formattedTime,
            pending: false,
          };
          return { ...prev, [chatId]: newMessages };
        } else {
          return {
            ...prev,
            [chatId]: [
              ...chatMessages,
              {
                id: msg.id,
                senderId: msg.fromUserId,
                text: msg.message,
                time: formattedTime,
                pending: false,
              },
            ],
          };
        }
      });
    },
    (userId, isOnline) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, online: isOnline } : u))
      );
    }
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3305/api/users?exclude=${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const formatted = res.data.map((u) => ({
          id: u.id,
          name: u.name,
          online: u.isOnline,
        }));
        setUsers(formatted);
        if (formatted.length > 0 && !selectedChat.id) {
          setSelectedChat({ type: "user", id: formatted[0].id });
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    const fetchGroups = async () => {
      try {
        const res = await axios.get("http://localhost:3305/api/groups/my-groups", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroups(res.data);
      } catch (err) {
        console.error("Error fetching groups:", err);
      }
    };

    fetchUsers();
    fetchGroups();
  }, [user.id, token]);

  useEffect(() => {
    if (!selectedChat.id) return;

    const fetchMessages = async () => {
      try {
        const url =
          selectedChat.type === "user"
            ? `http://localhost:3305/api/messages/private/${user.id}/${selectedChat.id}`
            : `http://localhost:3305/api/messages/groups/${selectedChat.id}`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const msgs = res.data.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          text: m.content,
          time: new Date(m.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          pending: false,
        }));

        setMessages((prev) => ({ ...prev, [selectedChat.id]: msgs }));
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };

    const fetchGroupMembers = async () => {
      try {
        if (selectedChat.type === "group") {
          const res = await axios.get(
            `http://localhost:3305/api/groups/group-members/${selectedChat.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setChatParticipants(res.data);
        } else {
          setChatParticipants([]);
        }
      } catch (err) {
        console.error("Failed to fetch group members", err);
      }
    };

    fetchMessages();
    fetchGroupMembers();
  }, [selectedChat, token, user.id]);

  const sendMessage = (text) => {
    if (!text.trim() || !selectedChat.id) return;

    const tempId = "temp-" + Date.now() + "-" + Math.random();
    const newMessage = {
      id: tempId,
      senderId: user.id,
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      pending: true,
    };

    setMessages((prev) => {
      const chatMessages = prev[selectedChat.id] || [];
      return {
        ...prev,
        [selectedChat.id]: [...chatMessages, newMessage],
      };
    });

    if (selectedChat.type === "user") {
      sendPrivateMessage(selectedChat.id, text);
    } else {
      sendGroupMessage(selectedChat.id, text);
    }
  };

  const handleCreateGroup = async (groupName, selectedMembers, isBroadcast = false) => {
    if (!groupName.trim() || selectedMembers.length < 1) {
      alert("Please enter a group name and select at least one member.");
      return;
    }

    const payload = {
      name: groupName,
      memberIds: selectedMembers,
      type: isBroadcast ? "broadcast" : "group",
    };

    try {
      const response = await fetch("http://localhost:3305/api/groups/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Group created successfully!");
        setGroups((prev) => [...prev, data.group]);
      } else {
        alert(data.error || "Failed to create group.");
      }
    } catch (err) {
      console.error("Create group failed:", err);
      alert("Server error while creating group.");
    }
  };

  return (
    <Layout style={{ height: "100%" }}>
      {showSidebar && (
       <Sider
  collapsible
  collapsed={isSidebarCollapsed}
  width={280}
  collapsedWidth={60}
  trigger={null} // we use custom toggle
  style={{
    background: "#fff",
    borderRight: "1px solid #f0f0f0",
    overflowY: "auto",
    transition: "all 0.3s ease-in-out",
  }}
>
  <Sidebar
    users={users}
    groups={groups}
    selected={selectedChat}
    onSelect={setSelectedChat}
    onCreateGroup={handleCreateGroup}
    collapsed={isSidebarCollapsed} // pass collapsed state
  />
</Sider>


      )}

      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #eee",
          }}
        >
         <Button
  icon={isSidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
  onClick={() => setIsSidebarCollapsed((prev) => !prev)}
  style={{ fontSize: 18 }}
/>

          <Button danger type="primary" onClick={onLogout}>
            Logout
          </Button>
        </Header>

        <Content style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

          <ChatArea
            user={user}
            chatUser={
              selectedChat.type === "user"
                ? users.find((u) => u.id === selectedChat.id)
                : groups.find((g) => g.id === selectedChat.id)
            }
            messages={messages[selectedChat.id] || []}
            onSendMessage={sendMessage}
            participants={chatParticipants}
            users={usersInTheChat || []}
          />

          {!connected && (
            <div style={{ color: "orange", textAlign: "center", padding: 10 }}>
              Connecting to chat server...
            </div>
          )}

          {authError && (
            <div style={{ color: "red", textAlign: "center", padding: 10 }}>
              Authentication error: {authError}
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
