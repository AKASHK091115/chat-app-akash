import React, { useState, useEffect } from "react";
import {
  Tabs,
  Button,
  List,
  Avatar,
  Input,
  Checkbox,
  Space,
  Divider,
  Typography,
  message,
  Badge,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  NotificationOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { TabPane } = Tabs;
const { Title } = Typography;

export default function Sidebar({
  users,
  groups,
  selected,
  onSelect,
  onCreateGroup,
  token,
  collapsed = false,
}) {
  const [activeTab, setActiveTab] = useState("contacts");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [searchTerm, setSearchTerm] = useState(""); // 🆕 search input

  // 🧠 Unread counts
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const res = await axios.get("/api/messages/unread/counts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const map = {};
        res.data.forEach(({ chatId, unreadCount }) => {
          map[chatId] = unreadCount;
        });
        setUnreadCounts(map);
      } catch (err) {
        console.error("Failed to fetch unread counts", err);
      }
    };

    fetchUnreadCounts();
  }, [token]);

  // 🧠 Filters
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter((g) =>
    g.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  const handleSubmit = (isBroadcast = false) => {
    if (!groupName.trim() || selectedMembers.length < 1) {
      message.warning("Please enter group name and select members");
      return;
    }

    onCreateGroup(groupName, selectedMembers, isBroadcast);
    setCreatingGroup(false);
    setGroupName("");
    setSelectedMembers([]);
  };

  const renderUserList = () => (
    <>
      <Input.Search
        allowClear
        placeholder="Search contacts..."
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <List
        itemLayout="horizontal"
        dataSource={filteredUsers}
        renderItem={(user) => (
          <List.Item
            onClick={() => onSelect({ type: "user", id: user.id })}
            style={{
              backgroundColor:
                selected?.type === "user" && selected.id === user.id
                  ? "#e6f7ff"
                  : "transparent",
              cursor: "pointer",
              borderRadius: 4,
              padding: "8px 12px",
            }}
          >
            <List.Item.Meta
              avatar={
                <Badge count={unreadCounts[user.id] || 0} size="small">
                  <Avatar
                    icon={<UserOutlined />}
                    style={{
                      backgroundColor: user.online ? "#52c41a" : "#ccc",
                    }}
                  />
                </Badge>
              }
              title={!collapsed ? user.name : null}
            />
          </List.Item>
        )}
      />
    </>
  );

  const renderGroupList = (filterType = "group") => {
    const filtered = filteredGroups.filter(
      (g) =>
        (filterType === "group" && g.type !== "broadcast") ||
        (filterType === "broadcast" && g.type === "broadcast")
    );

    return (
      <>
        <Input.Search
          allowClear
          placeholder={`Search ${filterType === "group" ? "groups" : "broadcasts"}...`}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <List
          itemLayout="horizontal"
          dataSource={filtered}
          renderItem={(group) => (
            <List.Item
              onClick={() => onSelect({ type: filterType, id: group.id })}
              style={{
                backgroundColor:
                  selected?.type === filterType && selected.id === group.id
                    ? "#e6f7ff"
                    : "transparent",
                cursor: "pointer",
                borderRadius: 6,
                padding: "8px 12px",
                marginBottom: 6,
                transition: "background 0.2s ease-in-out",
              }}
            >
              <List.Item.Meta
                avatar={
                  <Badge count={unreadCounts[group.id] || 0} size="small">
                    <Avatar
                      icon={
                        filterType === "group" ? (
                          <TeamOutlined />
                        ) : (
                          <NotificationOutlined />
                        )
                      }
                    />
                  </Badge>
                }
                title={
                  <span style={{ fontWeight: 500 }}>
                    {group.name?.trim() ||
                      (filterType === "group"
                        ? "[Unnamed]"
                        : "[Unnamed Broadcast]")}
                  </span>
                }
              />
            </List.Item>
          )}
        />
      </>
    );
  };

  const renderCreateSection = (isBroadcast = false) => (
    <div style={{ marginBottom: 16 }}>
      <Input
        placeholder={isBroadcast ? "Broadcast Group Name" : "Group Name"}
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <div
        style={{
          maxHeight: 100,
          overflowY: "auto",
          marginBottom: 10,
        }}
      >
        {users.map((user) => (
          <Checkbox
            key={user.id}
            checked={selectedMembers.includes(user.id)}
            onChange={() => toggleMember(user.id)}
            style={{ display: "block", marginBottom: 4 }}
          >
            {user.name}
          </Checkbox>
        ))}
      </div>
      <Space>
        <Button type="primary" onClick={() => handleSubmit(isBroadcast)}>
          Submit
        </Button>
        <Button
          danger
          onClick={() => {
            setCreatingGroup(false);
            setGroupName("");
            setSelectedMembers([]);
          }}
        >
          Cancel
        </Button>
      </Space>
      <Divider />
    </div>
  );

  return (
    <div
      style={{
        width: 280,
        minWidth: 280,
        maxWidth: 280,
        height: "100vh",
        borderRight: "1px solid #f0f0f0",
        overflowY: "auto",
        padding: 16,
        flexShrink: 0,
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Title
        level={4}
        style={{ textAlign: "center", display: collapsed ? "none" : "block" }}
      >
        💬 ChatApp
      </Title>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          setCreatingGroup(false);
          setSearchTerm(""); // 🧽 clear search on tab change
        }}
      >
        <TabPane
          key="contacts"
          tab={collapsed ? <UserOutlined /> : "Contacts"}
        >
          {!collapsed && renderUserList()}
        </TabPane>

        <TabPane key="groups" tab={collapsed ? <TeamOutlined /> : "Groups"}>
          {!collapsed && (
            <>
              {!creatingGroup ? (
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  block
                  style={{ marginBottom: 10 }}
                  onClick={() => setCreatingGroup(true)}
                >
                  Create Group
                </Button>
              ) : (
                renderCreateSection(false)
              )}
              {renderGroupList("group")}
            </>
          )}
        </TabPane>

        <TabPane
          key="broadcast"
          tab={collapsed ? <NotificationOutlined /> : "Broadcast"}
        >
          {!collapsed && (
            <>
              {!creatingGroup ? (
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  block
                  style={{ marginBottom: 10 }}
                  onClick={() => setCreatingGroup(true)}
                >
                  Create Broadcast
                </Button>
              ) : (
                renderCreateSection(true)
              )}
              {renderGroupList("broadcast")}
            </>
          )}
        </TabPane>
      </Tabs>
    </div>
  );
}
