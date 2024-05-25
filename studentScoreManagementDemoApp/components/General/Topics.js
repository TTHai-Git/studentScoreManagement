import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { authApi, endpoints } from "../../configs/APIs";
import MyStyle from "../../styles/MyStyle";
import { Button, TextInput } from "react-native-paper";

// Diễn đàn của sinh viên và giáo viên
const Topics = ({ navigaion, route }) => {
  const studyclassroom_id = route.params?.studyclassroom_id;
  const token = route.params?.token;
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [topics, setTopics] = useState([]);
  const [title, setTitle] = useState("");

  const loadTopics = async () => {
    if (page > 0) {
      try {
        setLoading(true);
        let url = `${endpoints["get-topics"](studyclassroom_id)}?page=${page}`;
        let res = await authApi(token).get(url);
        console.log(res.data.results);
        if (page === 1) setTopics(res.data.Topics);
        else if (page > 1)
          setTopics((cunrrent) => {
            return [...cunrrent, res.data.results];
          });
        if (res.data.next === null) setPage(0);
      } catch (ex) {
        console.error(ex);
      } finally {
        setLoading(false);
      }
    }
  };

  const lockOrUnlockTopic = async (topic_id) => {
    try {
      let url = `${endpoints["lock-or-unlock-topic"](topic_id)}`;
      let res = await authApi(token).patch(url);
      console.log(res.data.message);
    } catch (ex) {
      console.error(ex);
    } finally {
      console.log(res.data.message);
    }
  };

  const addTopic = async () => {
    try {
      let url = `${endpoints["add-topic"](studyclassroom_id)}`;
      let res = await authApi(token).post(url, {
        title: title,
      });

      console.log(res.data.message);
    } catch (ex) {
      console.error(ex);
    } finally {
      console.log(res.data.message);
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
    if (loading === false && isCloseToBottom(nativeEvent)) {
      setPage(page + 1);
    }
  };

  // useEffect(() => {
  //   loadStudents();
  // }, [page]);

  return (
    <View style={[MyStyle.container, MyStyle.centerContainer]}>
      <ScrollView onScroll={loadMore}>
        <RefreshControl onRefresh={() => loadTopics} />
        {loading && <ActivityIndicator />}
        {topics.map((c) => {
          return (
            <TouchableOpacity
              key={c.id}
              onPress={() => navigaion.navigate("Comments", { topic_id: c.id })}
            >
              <Text>Id: {c.id}</Text>
              <Text>Title{c.title}</Text>
              <Text>Thời gian tạo diễn đàn: {c.created_date}</Text>
              <Text>Tình trạng{c.active}</Text>
              <Button onPress={() => lockOrUnlockTopic(c.id)}>
                Khoa Diễn Đàn
              </Button>
            </TouchableOpacity>
          );
        })}
        {loading && page > 1 && <ActivityIndicator />}
      </ScrollView>
      <TextInput
        placeholder="Nhập tên diễn đàn cần tạo..."
        value={title}
        onChangeText={(t) => setTitle(t)}
      ></TextInput>
      <Button onPress={addTopic}>Tạo diễn đàn</Button>
    </View>
  );
};
export default Topics;
