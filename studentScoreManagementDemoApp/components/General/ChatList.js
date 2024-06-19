import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { auth, database } from "../../configs/Firebase";
import { Avatar } from "react-native-paper";
import MyStyle from "../../styles/MyStyle";

const ChatList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [imageError, setImageError] = useState(false);
  const currentUser = auth.currentUser;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userCollection = collection(database, "users");
        const userSnapshot = await getDocs(userCollection);
        const userList = userSnapshot.docs.map((doc) => doc.data());

        // Filter out the current user from the userList
        const filteredUserList = userList.filter(
          (user) => user.uid !== currentUser.uid && user.role !== "admin"
        );

        const fetchLastMessages = filteredUserList.map(async (user) => {
          const roomId = [currentUser.uid, user.uid].sort().join("_");
          const messagesCollection = collection(
            database,
            "rooms",
            roomId,
            "messages"
          );
          const lastMessageQuery = query(
            messagesCollection,
            orderBy("createdAt", "desc"),
            limit(1)
          );
          const lastMessageSnapshot = await getDocs(lastMessageQuery);

          if (!lastMessageSnapshot.empty) {
            const lastMessageData = lastMessageSnapshot.docs[0].data();
            return {
              ...user,
              lastMessage: lastMessageData.text,
              lastMessageTime: lastMessageData.createdAt.toDate(),
            };
          } else {
            return {
              ...user,
              lastMessage: "No messages",
              lastMessageTime: null,
            };
          }
        });

        const usersWithLastMessages = await Promise.all(fetchLastMessages);

        // Sort users by lastMessageTime in descending order
        usersWithLastMessages.sort((a, b) => {
          if (a.lastMessageTime && b.lastMessageTime) {
            return b.lastMessageTime - a.lastMessageTime;
          } else if (a.lastMessageTime) {
            return -1;
          } else if (b.lastMessageTime) {
            return 1;
          } else {
            return 0;
          }
        });

        setUsers(usersWithLastMessages);
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false); // Set loading to false if there is an error
      }
    };

    fetchUsers();
  }, [currentUser]);

  useEffect(() => {
    const unsubscribes = users.map((user) => {
      const roomId = [currentUser.uid, user.uid].sort().join("_");
      const messagesCollection = collection(
        database,
        "rooms",
        roomId,
        "messages"
      );
      const lastMessageQuery = query(
        messagesCollection,
        orderBy("createdAt", "desc"),
        limit(1)
      );

      return onSnapshot(lastMessageQuery, (snapshot) => {
        if (!snapshot.empty) {
          const lastMessageData = snapshot.docs[0].data();
          setUsers((prevUsers) => {
            const updatedUsers = prevUsers.map((u) => {
              if (u.uid === user.uid) {
                return {
                  ...u,
                  lastMessage: lastMessageData.text,
                  lastMessageTime: lastMessageData.createdAt.toDate(),
                };
              }
              return u;
            });

            // Sort users by lastMessageTime in descending order
            updatedUsers.sort((a, b) => {
              if (a.lastMessageTime && b.lastMessageTime) {
                return b.lastMessageTime - a.lastMessageTime;
              } else if (a.lastMessageTime) {
                return -1;
              } else if (b.lastMessageTime) {
                return 1;
              } else {
                return 0;
              }
            });

            return updatedUsers;
          });
        }
      });
    });

    return () => {
      // Unsubscribe from all listeners when component unmounts
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [users, currentUser]);

  const createChatRoom = async (otherUser) => {
    if (!currentUser || !currentUser.uid) {
      console.error("Invalid currentUser:", currentUser);
      return;
    }
    if (!otherUser || !otherUser.uid) {
      console.error("Invalid otherUser:", otherUser);
      return;
    }

    const roomId = [currentUser.uid, otherUser.uid].sort().join("_");
    const roomRef = doc(database, "rooms", roomId);

    try {
      await setDoc(roomRef, {
        users: [currentUser.uid, otherUser.uid],
        createdAt: new Date(),
      });
      navigation.navigate("ChatRoom", { roomId });
    } catch (error) {
      console.error("Error creating chat room:", error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />; // Display loading indicator while fetching data
  }

  return (
    <View style={MyStyle.container}>
      <FlatList
          data={users}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ flex: 1, flexDirection: "row", margin: 10 }}
              onPress={() => createChatRoom(item)}
            >
              <Avatar.Image
                size={50}
                source={
                  imageError || !item.avatar
                    ? require("../../assets/images/default-avatar.png") // Path to your default image
                    : { uri: item.avatar }
                }
                onError={() => setImageError(true)}
              />

              <View style={{ flex: 1, padding: 5 }}>
                <View
                  style={{
                    justifyContent: "space-between",
                    flexDirection: "row",
                  }}
                >
                  <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                  <Text>
                    {item.lastMessageTime
                      ? item.lastMessageTime.toLocaleTimeString()
                      : "No messages"}
                  </Text>
                </View>
                <Text>{item.lastMessage}</Text>
              </View>
            </TouchableOpacity>
          )}
      />
    </View>
  );
};

export default ChatList;
