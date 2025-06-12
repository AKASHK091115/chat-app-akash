import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3305";

export function useSocket(token, onMessageReceived, onUserStatusChange, onGroupsUpdate) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Store callbacks in refs to avoid stale closures
  const onMessageReceivedRef = useRef(onMessageReceived);
  const onUserStatusChangeRef = useRef(onUserStatusChange);
  const onGroupsUpdateRef = useRef(onGroupsUpdate);

  // Store received message IDs to avoid duplicates
  const receivedMessageIds = useRef(new Set());

  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
    onUserStatusChangeRef.current = onUserStatusChange;
    onGroupsUpdateRef.current = onGroupsUpdate;
  }, [onMessageReceived, onUserStatusChange, onGroupsUpdate]);

  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    const handleGroupMessage = (message) => {
      if (!message?.id) {
        // If message has no id, just forward it (fallback)
        onMessageReceivedRef.current?.(message);
        return;
      }
      if (receivedMessageIds.current.has(message.id)) {
        // Duplicate detected — ignore
        return;
      }
      receivedMessageIds.current.add(message.id);
      onMessageReceivedRef.current?.(message);
    };

    const handlePrivateMessage = (message) => {
      if (!message?.id) {
        onMessageReceivedRef.current?.(message);
        return;
      }
      if (receivedMessageIds.current.has(message.id)) {
        return;
      }
      receivedMessageIds.current.add(message.id);
      onMessageReceivedRef.current?.(message);
    };

    const handleUpdateGroups = (groups) => {
      onGroupsUpdateRef.current?.(groups);
      groups.forEach((group) => {
        socket.emit("join_group", group.id);
      });
    };

    socket.on("connect", () => {
      setConnected(true);
      setAuthError(null);

      console.log("🔌 Connected to socket:", socket.id);

      socket.emit("request_groups");
      socket.emit("authenticate", { token });
    });

    socket.on("update_groups", handleUpdateGroups);

    socket.on("authenticated", (data) => {
      console.log("✅ Socket authenticated:", data);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connect error:", err.message);
      setAuthError(err.message);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      console.log("❎ Disconnected from socket server");
    });

    socket.on("user_online", (userId) => {
      onUserStatusChangeRef.current?.(userId, true);
    });

    socket.on("user_offline", (userId) => {
      onUserStatusChangeRef.current?.(userId, false);
    });

    socket.on("private_message", handlePrivateMessage);
    socket.on("group_message", handleGroupMessage);

    // Cleanup on unmount to prevent listener accumulation
    return () => {
      if (socketRef.current) {
        socket.off("update_groups", handleUpdateGroups);
        socket.off("private_message", handlePrivateMessage);
        socket.off("group_message", handleGroupMessage);
        socket.disconnect();
        socketRef.current = null;
        receivedMessageIds.current.clear();
      }
    };
  }, [token]);

  const sendPrivateMessage = (toUserId, message) => {
    if (!socketRef.current) return;
    socketRef.current.emit("private_message", { toUserId, message });
  };

  const sendGroupMessage = (groupId, message) => {
    if (!socketRef.current) return;
    socketRef.current.emit("group_message", { groupId, message });
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      receivedMessageIds.current.clear();
    }
  };

  return { connected, authError, sendPrivateMessage, sendGroupMessage, disconnect };
}
