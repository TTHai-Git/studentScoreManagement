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
  Modal,
  Portal,
  Provider,
  TextInput,
  Dialog,
  Paragraph,
} from "react-native-paper";
import Styles from "../General/Styles";
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
      } catch (ex) {
        console.error(ex);
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
    } catch (ex) {
      console.log(ex);
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
    } catch (ex) {
      console.log(ex);
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
                <View style={Styles.topic}>
                  <Text style={Styles.topicTitle}>Tiêu đề: {c.title}</Text>
                  <Text style={Styles.topicDate}>
                    Ngày tạo: {moment(c.created_date).fromNow()}
                  </Text>
                  <Text style={Styles.topicStatus}>
                    Tình trạng: {c.active ? "Đang mở khóa" : "Đang khóa"}
                  </Text>
                  {user.role === "teacher" && (
                    <View style={{ alignItems: "flex-end" }}>
                      <Button
                        style={[MyStyle.button_user, Styles.button_topic]}
                        mode="contained"
                        onPress={() => confirmAction(c.id, "lockUnlock")}
                      >
                        {c.active ? "Khóa diễn đàn" : "Mở khóa diễn đàn"}
                      </Button>
                    </View>
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
              style={MyStyle.input}
            />
            <Button
              style={MyStyle.button_user}
              mode="contained"
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
            <Dialog.Title>Confirmation</Dialog.Title>
            <Dialog.Content>
              <Paragraph>
                {dialogState.action === "lockUnlock"
                  ? "Are you sure you want to change the topic status?"
                  : "Are you sure you want to add this topic?"}
              </Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setConfirmVisible(false)}>Cancel</Button>
              <Button onPress={handleConfirmAction}>Yes</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </Provider>
  );
};

export default Topics;
