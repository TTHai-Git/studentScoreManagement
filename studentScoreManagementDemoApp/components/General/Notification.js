import { StyleSheet, View } from "react-native";
import { Avatar, Divider, IconButton, List, Text } from "react-native-paper";
import { ScrollView } from "react-native-gesture-handler";
import { useContext, useEffect, useState } from "react";
import RenderHTML from "react-native-render-html";
import { authApi, endpoints } from "../../configs/APIs";
import { MyDispatchContext, MyUserContext } from "../../configs/Contexts";

const Notification = ({ route }) => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext);
  const token = route.params?.token;

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const url = `${endpoints["load-notifications"](user.id)}`;
      let res = await authApi(token).get(url);
      console.log(res.data.results);
      setNotification(res.data.results);
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data) {
        Alert.alert("Error", error.response.data.message);
      } else {
        Alert.alert("Error", "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const initialNotifications = [
    {
      id: 1,
      title: "New Comment",
      message: "Someone commented on your post.",
      timestamp: "2m ago",
      avatar: "comment",
      seen: false,
    },
    {
      id: 2,
      title: "Message Received",
      message: "You have a new message from John.",
      timestamp: "10m ago",
      avatar: "email",
      seen: false,
    },
    {
      id: 3,
      title: "System Update",
      message: "Your app was updated to version 1.1.",
      timestamp: "1h ago",
      avatar: "information",
      seen: false,
    },
  ];
  const [notifications, setNotifications] = useState(initialNotifications);
  const handleNotificationClick = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id ? { ...notification, seen: true } : notification
      )
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Notifications</Text>
        <IconButton
          icon="bell-outline"
          size={28}
          onPress={() => {}}
          style={styles.bellIcon}
        />
      </View>

      {notifications.map((notification) => (
        <View key={notification.id}>
          <List.Item
            title={notification.title}
            description={notification.message}
            left={() => (
              <Avatar.Icon
                icon={notification.avatar}
                size={40}
                style={styles.avatarIcon}
              />
            )}
            right={() => (
              <Text style={styles.timestamp}>{notification.timestamp}</Text>
            )}
            // Change opacity for seen notifications
            style={notification.seen ? styles.seenNotification : null}
            onPress={() => handleNotificationClick(notification.id)} // Mark as seen when clicked
          />
          <Divider />
        </View>
      ))}
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    paddingHorizontal: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  bellIcon: {
    marginRight: -10,
  },
  avatarIcon: {
    backgroundColor: "#6200ee",
  },
  timestamp: {
    alignSelf: "center",
    color: "#777",
  },
  seenNotification: {
    opacity: 0.5, // Dim the notification to indicate it's been seen
    backgroundColor: "#e0e0e0", // Optional: change the background for seen notifications
  },
});
export default Notification;
