import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  limit,
} from "firebase/firestore";
import { auth, database } from "../../configs/Firebase";
import { Avatar } from "react-native-paper";
import MyStyle from "../../styles/MyStyle";

const ChatList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;
  const navigation = useNavigation();

  // Use ref to track active listeners
  const unsubscribeRefs = useRef([]);

  const fetchUsers = useCallback(async () => {
    try {
      const userSnapshot = await getDocs(collection(database, "users"));
      const userList = userSnapshot.docs.map((doc) => doc.data());

      const usersWithMessages = await Promise.all(
        userList.map(async (user) => {
          const roomId = [currentUser.uid, user.uid].sort().join("_");
          const messagesQuery = query(
            collection(database, "rooms", roomId, "messages"),
            orderBy("createdAt", "desc"),
            limit(1)
          );
          const messageSnapshot = await getDocs(messagesQuery);

          const lastMessageData = messageSnapshot.empty
            ? { text: "Chưa có tin nhắn", createdAt: null }
            : messageSnapshot.docs[0].data();

          return {
            ...user,
            lastMessage: lastMessageData.text,
            lastMessageTime: lastMessageData.createdAt?.toDate() || null,
            hasImageError: false,
          };
        })
      );

      usersWithMessages.sort(
        (a, b) =>
          (b.lastMessageTime?.getTime() || 0) -
          (a.lastMessageTime?.getTime() || 0)
      );

      setUsers(usersWithMessages);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Start listeners when the screen is focused
  useFocusEffect(
    useCallback(() => {
      users.forEach((user) => {
        const roomId = [currentUser.uid, user.uid].sort().join("_");
        const messagesQuery = query(
          collection(database, "rooms", roomId, "messages"),
          orderBy("createdAt", "desc"),
          limit(1)
        );

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          if (!snapshot.empty) {
            const lastMessageData = snapshot.docs[0].data();
            setUsers((prevUsers) =>
              prevUsers.map((u) =>
                u.uid === user.uid
                  ? {
                      ...u,
                      lastMessage: lastMessageData.text,
                      lastMessageTime: lastMessageData.createdAt.toDate(),
                    }
                  : u
              )
            );
          }
        });

        // Store the unsubscribe function
        unsubscribeRefs.current.push(unsubscribe);
      });

      // Cleanup listeners when the screen is unfocused
      return () => {
        unsubscribeRefs.current.forEach((unsubscribe) => unsubscribe());
        unsubscribeRefs.current = []; // Reset the ref
      };
    }, [users, currentUser])
  );

  const createChatRoom = async (otherUser) => {
    try {
      const roomId = [currentUser.uid, otherUser.uid].sort().join("_");
      const roomRef = doc(database, "rooms", roomId);

      await setDoc(roomRef, {
        users: [currentUser.uid, otherUser.uid],
        createdAt: new Date(),
      });

      // Unsubscribe from chat list listeners before navigating
      unsubscribeRefs.current.forEach((unsubscribe) => unsubscribe());
      unsubscribeRefs.current = [];

      navigation.navigate("ChatRoom", { roomId });
    } catch (error) {
      console.error("Error creating chat room:", error);
    }
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={{ flexDirection: "row", margin: 10 }}
      onPress={() => createChatRoom(item)}
    >
      <Avatar.Image
        size={50}
        source={
          item.avatar
            ? { uri: item.avatar }
            : require("../../assets/images/default-avatar.png")
        }
        onError={() =>
          setUsers((prevUsers) =>
            prevUsers.map((u) =>
              u.uid === item.uid ? { ...u, hasImageError: true } : u
            )
          )
        }
      />
      <View style={{ flex: 1, padding: 5 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontWeight: "bold" }}>
            {item.name} - {item.role}
          </Text>
          <Text>
            {item.lastMessageTime
              ? item.lastMessageTime.toLocaleTimeString()
              : "Chưa có tin nhắn"}
          </Text>
        </View>
        <Text>{item.lastMessage}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={MyStyle.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.uid}
        renderItem={renderUserItem}
        initialNumToRender={10}
        getItemLayout={(_, index) => ({
          length: 70,
          offset: 70 * index,
          index,
        })}
      />
    </View>
  );
};

export default ChatList;
