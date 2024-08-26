import { useEffect, useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { authApi, endpoints } from "../../configs/APIs";
import MyStyle from "../../styles/MyStyle";
import {
  Button,
  Portal,
  Provider,
  TextInput,
  Dialog,
  Paragraph,
} from "react-native-paper";
import Styles from "../General/Styles";
import Icon from "react-native-vector-icons/FontAwesome";
import moment from "moment";

const Topics = ({ navigation, route }) => {
  const studyclassroom_id = route.params?.studyclassroom_id;
  const token = route.params?.token;
  const user = route.params?.user;

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [dialogState, setDialogState] = useState({
    topicId: null,
    action: null,
  });

  const loadTopics = async () => {
    if (page > 0) {
      try {
        setLoading(true);
        let url = `${endpoints["get-topics"](studyclassroom_id)}?page=${page}`;
        let res = await authApi(token).get(url);
        setTopics((prevTopics) =>
          page === 1 ? res.data.results : [...prevTopics, ...res.data.results]
        );
        if (res.data.next === null) setPage(0);
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
    }
  };

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  const loadMore = ({ nativeEvent }) => {
    if (!loading && isCloseToBottom(nativeEvent)) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    loadTopics();
  }, [page]);

  const confirmAction = (topic_id, action) => {
    setDialogState({ topicId: topic_id, action: action });
    setConfirmVisible(true);
  };

  const handleConfirmAction = async () => {
    setConfirmVisible(false);
    const { topicId, action } = dialogState;
    if (action === "lockUnlock") {
      await LockOrUnlockTopic(topicId);
    } else if (action === "add") {
      await addTopic();
    }
  };

  const LockOrUnlockTopic = async (topic_id) => {
    try {
      let url = `${endpoints["lock-or-unlock-topic"](topic_id)}`;
      let res = await authApi(token).patch(url);
      console.log(res.data.message);
      Alert.alert(res.data.message);
      setPage(1);
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

  const addTopic = async () => {
    if (title.trim().length === 0) {
      Alert.alert("Error", "Topic title cannot be empty");
      return;
    }
    try {
      let url = `${endpoints["add-topic"](studyclassroom_id)}`;
      let res = await authApi(token).post(url, { title });
      console.log(res.data.message);
      Alert.alert(res.data.message);
      setTitle("");
      setPage(1);
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

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadTopics();
    setRefreshing(false);
  };

  return (
    <Provider>
      <View style={[MyStyle.container, MyStyle.centerContainer]}>
        {topics.length === 0 ? (
          <>
            <Text>Chưa có diễn đàn nào được tạo</Text>
          </>
        ) : (
          <ScrollView
            style={{ width: "100%", padding: 10 }}
            onScroll={loadMore}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {loading && page === 1 && <ActivityIndicator />}
            {topics.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() =>
                  navigation.navigate("Comments", {
                    token: token,
                    topic_id: c.id,
                  })
                }
              >
                <View style={[Styles.topic, Styles.card]}>
                  <View style={Styles.topicHeader}>
                    <Text style={Styles.topicTitle}>
                      <Icon name="comments" size={20} color="#4CAF50" />{" "}
                      {c.title}
                    </Text>
                  </View>
                  <Text style={Styles.topicDate}>
                    <Icon name="clock-o" size={16} color="#888" />{" "}
                    {moment(c.created_date).fromNow()}
                  </Text>
                  <Text style={Styles.topicStatus}>
                    <Icon
                      name={c.active ? "unlock" : "lock"}
                      size={16}
                      color={c.active ? "#4CAF50" : "#F44336"}
                    />{" "}
                    Tình trạng: {c.active ? "Đang mở khóa" : "Đang khóa"}
                  </Text>
                  {user.role === "teacher" && (
                    <Button
                      style={Styles.button_topic}
                      mode="outlined"
                      icon={c.active ? "lock-open-outline" : "lock-outline"}
                      onPress={() => confirmAction(c.id, "lockUnlock")}
                    >
                      {c.active ? "Khóa" : "Mở khóa"}
                    </Button>
                  )}
                </View>
              </TouchableOpacity>
            ))}
            {loading && page > 1 && <ActivityIndicator />}
          </ScrollView>
        )}
        {user.role === "teacher" && (
          <View style={Styles.addTopic_Comment}>
            <TextInput
              placeholder="Nhập tên diễn đàn"
              value={title}
              onChangeText={(t) => setTitle(t)}
              style={[MyStyle.input, Styles.inputWithIcon]}
              left={<TextInput.Icon name={() => <Icon name="edit" />} />}
            />
            <Button
              style={MyStyle.button_user}
              mode="contained"
              icon={() => <Icon name="plus" size={16} color="#FFF" />}
              onPress={() => confirmAction(null, "add")}
            >
              Thêm diễn đàn
            </Button>
          </View>
        )}
        {/* Confirmation Dialog */}
        <Portal>
          <Dialog
            visible={confirmVisible}
            onDismiss={() => setConfirmVisible(false)}
          >
            <Dialog.Title>Xác nhận</Dialog.Title>
            <Dialog.Content>
              <Paragraph>
                {dialogState.action === "lockUnlock"
                  ? "Bạn có chắc muốn thay đổi trạng thái diễn đàn?"
                  : "Bạn có chắc muốn thêm diễn đàn này?"}
              </Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setConfirmVisible(false)}>Hủy</Button>
              <Button onPress={handleConfirmAction}>Đồng ý</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </Provider>
  );
};

export default Topics;
