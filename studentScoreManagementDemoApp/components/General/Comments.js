import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { authApi, endpoints } from "../../configs/APIs";
import MyStyle from "../../styles/MyStyle";
import { Avatar, Button, TextInput } from "react-native-paper";
import Styles from "../General/Styles";

const Comments = ({ navigation, route }) => {
  const topic_id = route.params?.topic_id;
  const token = route.params?.token;

  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const loadComments = async (reset = false) => {
    if (reset) {
      setPage(1);
    }
    if (page > 0) {
      try {
        setLoading(true);
        let url = `${endpoints["comments"](topic_id)}?page=${page}`;
        let res = await authApi(token).get(url);
        if (page === 1) {
          setComments(res.data.results);
        } else {
          setComments((current) => [...current, ...res.data.results]);
        }
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
      Alert.alert(res.data.message);
      setContent("");
      loadComments(true);
    } catch (ex) {
      console.error(ex);
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
    loadComments();
  }, [page]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadComments(true).then(() => setRefreshing(false));
  };

  return (
    <View style={[MyStyle.container, MyStyle.centerContainer]}>
      <ScrollView
        onScroll={loadMore}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && <ActivityIndicator />}
        {comments.map((c) => (
          <TouchableOpacity key={c.id}>
            <View style={Styles.topic}>
              <View>
                <Avatar.Image size={50} source={{ uri: c.user.avatar }} />
                <Text>Họ và tên: {c.user.last_name} {c.user.first_name}</Text>
              </View>
              <View>
                <Text>Thời gian bình luận: {c.created_date}</Text>
                <Text>Nội dung: {'\n'}
                  {c.content}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {loading && page > 1 && <ActivityIndicator />}
      </ScrollView>
      <View style={Styles.addTopic_Comment}>
        <TextInput
          placeholder="Viết bình luận"
          value={content}
          onChangeText={(t) => setContent(t)}
          style={MyStyle.input}
        />
        <Button style={MyStyle.button_user} mode="contained" onPress={addComment}>Bình luận</Button>
      </View>
    </View>
  );
};

export default Comments;
