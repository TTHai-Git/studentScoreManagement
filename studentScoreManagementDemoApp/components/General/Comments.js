import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { authApi, endpoints } from "../../configs/APIs";
import MyStyle from "../../styles/MyStyle";
import { Button, TextInput } from "react-native-paper";

// Diễn đàn của sinh viên và giáo viên
const Comments = ({ navigaion, route }) => {
  const topic_id = route.params?.topic_id_id;
  const token = route.params?.token;
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");

  const loadComments = async () => {
    if (page > 0) {
      try {
        setLoading(true);
        let url = `${endpoints["comments"](topic_id_id)}?page=${page}`;
        let res = await authApi(token).get(url);
        console.log(res.data.results);
        if (page === 1) setComments(res.data.Topics);
        else if (page > 1)
          setComments((cunrrent) => {
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

  const addComment = async () => {
    try {
      let url = `${endpoints["add-comment"](topic_id)}`;
      let res = await authApi(token).post(url, {
        content: content,
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

  useEffect(() => {
    loadComments();
  }, [page]);

  return (
    <View style={[MyStyle.container, MyStyle.centerContainer]}>
      <ScrollView onScroll={loadMore}>
        <RefreshControl onRefresh={() => loadTopics} />
        {loading && <ActivityIndicator />}
        {comments.map((c) => {
          return (
            <TouchableOpacity key={c.id}>
              <View>
                <Text>Id: {c.id}</Text>
                <Text>content: {c.content}</Text>
                <Text>Thời gian bình luận: {c.created_date}</Text>
              </View>
              <View>
                <Text>Username: {c.user.username}</Text>
                <Image source={{ uri: c.user.avatar.uri }}></Image>
              </View>
            </TouchableOpacity>
          );
        })}
        {loading && page > 1 && <ActivityIndicator />}
      </ScrollView>
      <TextInput
        placeholder="Nhập comment..."
        value={content}
        onChangeText={(t) => setContent(t)}
      ></TextInput>
      <Button onPress={addComment}>Bình luận</Button>
    </View>
  );
};
export default Topics;
