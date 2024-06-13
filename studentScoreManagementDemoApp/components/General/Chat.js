import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
} from "react-native";
import { authApi, endpoints } from "../../configs/APIs";

const Chat = ({ route }) => {
  const studyclassroom_id = route.params?.studyclassroom_id;
  const token = route.params?.token;
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const getMembersOfChatRoom = async () => {
    try {
      setLoading(true);
      let url = `${endpoints["member-of-chatroom"](studyclassroom_id)}`;
      let res = await authApi(token).get(url);
      setMembers(res.data.members);
    } catch (ex) {
      console.log(ex);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMembersOfChatRoom();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {members.map((c) => (
        <TouchableOpacity key={c.id} style={styles.chatItem}>
          <Image source={{ uri: c.avatar }} style={styles.avatar} />
          <View style={styles.chatInfo} key={c.id}>
            <Text style={styles.chatName}>{c.code}</Text>
            <Text style={styles.chatName}>{c.name}</Text>
            <Text style={styles.chatName}>{c.username}</Text>
            <Text style={styles.chatName}>{c.role}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#80b3ff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chatItem: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    color: "#fff",
    fontWeight: "bold",
  },
  chatMessage: {
    color: "#ccc",
  },
});

export default Chat;
