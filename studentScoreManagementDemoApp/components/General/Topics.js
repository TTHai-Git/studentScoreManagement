import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { authApi, endpoints } from "../../configs/APIs";
import moment from "moment";
import vi from "moment/locale/vi";
import {
  TextInput,
  Card,
  Dialog,
  Paragraph,
  Portal,
  Provider,
  Button,
} from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import MyStyle from "../../styles/MyStyle";
import { MyUserContext } from "../../configs/Contexts";

const Topics = ({ navigation, route }) => {
  const studyclassroom_id = route.params?.studyclassroom_id;
  const user = useContext(MyUserContext);

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
        let res = await authApi(user.access_token).get(url);
        setTopics((prevTopics) =>
          page === 1 ? res.data.results : [...prevTopics, ...res.data.results]
        );
        if (res.data.next === null) setPage(0);
      } catch (error) {
        console.log(error.response);
        Alert.alert(
          "Error",
          error.response?.data?.message || "Unexpected error occurred."
        );
      } finally {
        setLoading(false);
      }
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
      await lockOrUnlockTopic(topicId);
    } else if (action === "add") {
      await addTopic();
    }
  };

  const lockOrUnlockTopic = async (topic_id) => {
    try {
      let url = `${endpoints["lock-or-unlock-topic"](topic_id)}`;
      let res = await authApi(user.access_token).patch(url);
      Alert.alert("Success", res.data.message);
      setPage(1);
    } catch (error) {
      console.log(error.response);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Unexpected error occurred."
      );
    }
  };

  const addTopic = async () => {
    if (title.trim().length === 0) {
      Alert.alert("Error", "Topic title cannot be empty");
      return;
    }
    try {
      let url = `${endpoints["add-topic"](studyclassroom_id)}`;
      let res = await authApi(user.access_token).post(url, { title });
      Alert.alert("Success", res.data.message);
      setTitle("");
      setPage(1);
    } catch (error) {
      console.log(error.response);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Unexpected error occurred."
      );
    }
  };

  const delTopic = async (topic_id) => {
    try {
      setLoading(true);
      let url = `${endpoints["del-topic"](topic_id)}`;
      let res = await authApi(user.access_token).delete(url);
      Alert.alert("Success", res.data.message);
      setPage(1);
    } catch (error) {
      console.log(error.response);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Unexpected error occurred."
      );
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

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 1;
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

  const goComments = (topic_id) => {
    navigation.navigate("Comments", {
      topic_id: topic_id,
    });
  };

  return (
    <Provider>
      <View style={[MyStyle.container, { padding: 10 }]}>
        {loading && page === 1 ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : topics.length === 0 ? (
          <Text>Chưa có diễn đàn nào được tạo</Text>
        ) : (
          <ScrollView
            onScroll={loadMore}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {topics.map((c) => (
              <TouchableOpacity key={c.id} onPress={() => goComments(c.id)}>
                <Card key={c.id} style={{ marginBottom: 10 }}>
                  <Card.Title
                    title={c.title}
                    subtitle={moment(c.created_date).locale("vi", vi).fromNow()}
                    left={(props) => (
                      <Icon
                        {...props}
                        name="comments"
                        size={24}
                        color="#4CAF50"
                      />
                    )}
                  />
                  <Card.Content>
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
                        mode="outlined"
                        icon={c.active ? "lock-outline" : "lock-open-outline"}
                        onPress={() => confirmAction(c.id, "lockUnlock")}
                        style={{ marginTop: 10 }}
                      >
                        {c.active ? "Khóa" : "Mở khóa"}
                      </Button>
                    )}
                  </Card.Content>
                  {user.role === "teacher" && (
                    <TouchableOpacity
                      style={Styles.button_del}
                      onPress={() =>
                        Alert.alert(
                          "Xác Nhận Xoá:",
                          "Bạn có chắc muốn xoá diễn đàn này?",
                          [
                            {
                              text: "Huỷ",
                              style: "cancel",
                            },
                            {
                              text: "Đồng Ý",
                              onPress: () => delTopic(c.id),
                              style: "destructive",
                            },
                          ]
                        )
                      }
                    >
                      <Icon name="trash" size={16} color="#fff" />
                      <Text style={Styles.buttonText_del}>Xoá</Text>
                    </TouchableOpacity>
                  )}
                </Card>
              </TouchableOpacity>
            ))}
            {loading && page > 1 && <ActivityIndicator />}
          </ScrollView>
        )}
        {user.role === "teacher" && (
          <View
            style={[
              Styles.addTopic_Comment,
              {
                padding: 10,
                borderTopWidth: 1,
                borderColor: "#ddd",
                backgroundColor: "#fff",
                elevation: 2,
              },
            ]}
          >
            <TextInput
              placeholder="Nhập tên diễn đàn"
              value={title}
              onChangeText={(t) => setTitle(t)}
              style={{
                marginBottom: 10,
                backgroundColor: "#f4f4f4",
                borderRadius: 5,
              }}
              left={<TextInput.Icon name={() => <Icon name="edit" />} />}
            />
            <Button
              mode="contained"
              icon={() => <Icon name="plus-circle" size={20} />}
              onPress={() => confirmAction(null, "add")}
            >
              Tạo Diễn Đàn
            </Button>
          </View>
        )}

        <Portal>
          <Dialog
            visible={confirmVisible}
            onDismiss={() => setConfirmVisible(false)}
          >
            <Dialog.Title>Xác Nhận</Dialog.Title>
            <Dialog.Content>
              <Paragraph>Bạn có chắc chắn với hành động này không?</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setConfirmVisible(false)}>Huỷ</Button>
              <Button onPress={handleConfirmAction}>Đồng Ý</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </Provider>
  );
};

export default Topics;

const Styles = StyleSheet.create({
  button_del: {
    padding: 10,
    backgroundColor: "#F44336",
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText_del: {
    color: "#fff",
    marginLeft: 5,
  },
  topicStatus: {
    marginTop: 5,
    fontStyle: "italic",
  },
  addTopic_Comment: {
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
});
