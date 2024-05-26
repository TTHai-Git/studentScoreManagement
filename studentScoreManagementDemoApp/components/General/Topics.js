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
import { Button, TextInput } from "react-native-paper";

const Topics = ({ navigation, route }) => {
  const studyclassroom_id = route.params?.studyclassroom_id;
  const token = route.params?.token;
  const user = route.params?.user;

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const loadTopics = async () => {
    if (page > 0) {
      try {
        setLoading(true);
        let url = `${endpoints["get-topics"](studyclassroom_id)}?page=${page}`;
        let res = await authApi(token).get(url);
        console.log(res.data.results);
        if (page === 1) {
          setTopics(res.data.results);
        } else if (page > 1) {
          setTopics((current) => [...current, ...res.data.results]);
        }
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

  const LockOrUnlockTopic = async (topic_id) => {
    try {
      let url = `${endpoints["lock-or-unlock-topic"](topic_id)}`;
      let res = await authApi(token).patch(url);
      console.log(res.data.message);
      Alert.alert(res.data.message);
      // Reload topics to update status
      setPage(1);
    } catch (ex) {
      console.log(ex);
    }
  };

  const AddTopic = async () => {
    try {
      let url = `${endpoints["add-topic"](studyclassroom_id)}`;
      let res = await authApi(token).post(url, {
        title: title,
      });
      console.log(res.data.message);
      Alert.alert(res.data.message);
      // Reload topics to include the new topic
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
    <View style={[MyStyle.container, MyStyle.centerContainer]}>
      <ScrollView
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
            <Text>Tiêu đề: {c.title}</Text>
            <Text>Ngày tạo: {c.created_date}</Text>
            {c.active ? (
              <>
                <Text>Tình trạng: Đang mở khóa</Text>
                {user.role === "teacher" && (
                  <Button onPress={() => LockOrUnlockTopic(c.id)}>
                    Khóa diễn đàn
                  </Button>
                )}
              </>
            ) : (
              <>
                <Text>Tình trạng: Đang khóa</Text>
                {user.role === "teacher" && (
                  <Button onPress={() => LockOrUnlockTopic(c.id)}>
                    Mở khóa diễn đàn
                  </Button>
                )}
              </>
            )}
          </TouchableOpacity>
        ))}
        {loading && page > 1 && <ActivityIndicator />}
      </ScrollView>
      {user.role === "teacher" && (
        <>
          <TextInput
            placeholder="Nhập tên diễn đàn cần tạo..."
            value={title}
            onChangeText={(t) => setTitle(t)}
          />
          <Button onPress={AddTopic}>Tạo mới một diễn đàn</Button>
        </>
      )}
    </View>
  );
};

export default Topics;
