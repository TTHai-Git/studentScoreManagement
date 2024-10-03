import {
  Dimensions,
  StyleSheet,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  Avatar,
  Divider,
  IconButton,
  List,
  Modal,
  Portal,
  Provider,
  Text,
  Badge,
} from "react-native-paper";
import { ScrollView } from "react-native-gesture-handler";
import { useContext, useEffect, useState } from "react";
import RenderHTML from "react-native-render-html";
import { authApi, endpoints } from "../../configs/APIs";
import { MyUserContext } from "../../configs/Contexts";
import moment from "moment";
import vi from "moment/locale/vi";

const Notification = ({ route }) => {
  const user = useContext(MyUserContext);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [visible, setVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [page, setPage] = useState(1); // Pagination state
  const [hasMore, setHasMore] = useState(true); // To check if more data is available
  const contentWidth = Dimensions.get("window").width;

  const showModal = (notification) => {
    setSelectedNotification(notification);
    setVisible(true);
  };

  const hideModal = () => {
    setVisible(false);
    setSelectedNotification(null);
  };

  const loadNotifications = async (pageNum) => {
    try {
      setLoading(true);
      const url = `${endpoints["load-notifications"](user.id)}?page=${pageNum}`;
      let res = await authApi(user.access_token).get(url);
      if (pageNum === 1) {
        setNotifications(res.data.results); // Reset notifications on the first page
      } else {
        setNotifications((prev) => [...prev, ...res.data.results]); // Append new data
      }
      setHasMore(res.data.next !== null); // Check if there are more pages
    } catch (error) {
      console.log(error.response);
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
    if (hasMore) {
      loadNotifications(page);
    }
  }, [page]); // Load more notifications whenever `page` changes

  const handleNotificationClick = async (notification) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((item) =>
        item.id === notification.id ? { ...item, seen: true } : item
      )
    );
    showModal(notification);

    const url = `${endpoints["seen-notification"](notification.id)}`;
    try {
      const res = await authApi(user.access_token).post(url);
      console.log(res.data.message);
    } catch (error) {
      console.log(error.response);
      if (error.response && error.response.data) {
        Alert.alert("Error", error.response.data.message);
      } else {
        Alert.alert("Error", "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

    if (isAtBottom && !loading && hasMore) {
      setPage((prev) => prev + 1); // Load next page
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.seen
  ).length;

  return (
    <Provider>
      <ScrollView
        style={styles.container}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Danh Sách Sự Kiện</Text>

          <View style={styles.bellIconContainer}>
            <IconButton
              icon="bell-outline"
              size={28}
              onPress={() => {}}
              style={styles.bellIcon}
            />
            {unreadCount > 0 && (
              <Badge style={styles.badge}>{unreadCount}</Badge>
            )}
          </View>
        </View>

        {loading && page === 1 ? (
          <ActivityIndicator
            size="large"
            color="#6200ee"
            style={styles.loadingIndicator}
          />
        ) : (
          notifications.map((notification) => (
            <View key={notification.id}>
              <List.Item
                title={"Tiêu đề: " + notification.title}
                description={
                  "Khoa: " +
                  notification.department_name +
                  "\nHọc kỳ: " +
                  notification.semester_name +
                  " ; Năm học: " +
                  notification.semester_year
                }
                left={() => (
                  <Avatar.Icon
                    icon="information"
                    size={40}
                    style={styles.avatarIcon}
                  />
                )}
                right={() => (
                  <Text style={styles.timestamp}>
                    {moment(notification.created_date)
                      .locale("vi", vi)
                      .fromNow()}
                  </Text>
                )}
                style={notification.seen ? styles.seenNotification : null}
                onPress={() => handleNotificationClick(notification)}
              />
              <Divider />
            </View>
          ))
        )}

        {loading && page > 1 && (
          <ActivityIndicator
            size="large"
            color="#6200ee"
            style={styles.loadingIndicator}
          />
        )}

        <Portal>
          <Modal
            visible={visible}
            onDismiss={hideModal}
            contentContainerStyle={styles.modal}
          >
            {selectedNotification && (
              <ScrollView style={styles.modalScrollView}>
                <RenderHTML
                  style={styles.htmlContent}
                  contentWidth={contentWidth}
                  source={{
                    html: selectedNotification.content
                      ? selectedNotification.content
                      : `<h1>No content at here!</h1>`,
                  }}
                />
              </ScrollView>
            )}
          </Modal>
        </Portal>
      </ScrollView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  // Styles remain the same
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
  bellIconContainer: {
    position: "relative",
  },
  bellIcon: {
    marginRight: -10,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "red",
    color: "white",
  },
  avatarIcon: {
    backgroundColor: "#6200ee",
  },
  timestamp: {
    alignSelf: "center",
    color: "#777",
  },
  seenNotification: {
    opacity: 0.5,
    backgroundColor: "#e0e0e0",
  },
  modalScrollView: {
    maxHeight: 400,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
  },
  htmlContent: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    backgroundColor: "#fff",
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default Notification;
