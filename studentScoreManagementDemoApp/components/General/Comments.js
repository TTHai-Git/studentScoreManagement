import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import moment from "moment";
import * as DocumentPicker from "expo-document-picker";

const Comments = ({ navigation, route }) => {
  const topic_id = route.params?.topic_id;
  const token = route.params?.token;

  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const loadComments = async (reset = false) => {
    if (reset) {
      setPage(1);
    }
    if (page > 0) {
      try {
        setLoading(true);
        const url = `${endpoints["comments"](topic_id)}?page=${page}`;
        const res = await authApi(token).get(url);
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

  const selectFiles = async () => {
    try {
      const results = await DocumentPicker.getDocumentAsync({
        type: "*/*", // Allows all file types
        multiple: true, // Allow multiple file selection
      });
      if (results.canceled !== "true") {
        console.log(results.assets);
        setSelectedFiles(results.assets);
      }
    } catch (err) {
      console.log("Error picking files: ", err);
    }
  };

  const addComment = async () => {
    setLoading(true);
    const formData = new FormData();

    // Append content to the form data
    formData.append("content", content);

    // Append each selected file to the form data
    selectedFiles.forEach((file, index) => {
      formData.append("files", {
        uri: file.uri,
        type: file.mimeType || "application/octet-stream",
        name: file.name || `file-${index}`,
      });
    });

    try {
      const url = `${endpoints["add-comment"](topic_id)}`;
      const res = await authApi(token).post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      Alert.alert("Success", res.data.message);
      setContent("");
      setSelectedFiles([]); // Reset selected files after upload
      loadComments(true);
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        // Handle the 400 error
        Alert.alert("Error", ex.response.data.message);
      } else {
        // Handle other errors
        console.log("Unexpected error: ", ex);
      }
    } finally {
      setLoading(false);
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
                <Text>
                  Họ và tên: {c.user.last_name} {c.user.first_name}
                </Text>
              </View>
              <View>
                <Text>
                  Thời gian bình luận: {moment(c.created_date).fromNow()}
                </Text>
                <Text>
                  Nội dung: {"\n"}
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
        <Button
          style={MyStyle.button_user}
          mode="contained"
          onPress={selectFiles}
        >
          Chọn tệp
        </Button>
        <Text>{selectedFiles.map((file) => file.name).join(", ")}</Text>
        <Button
          style={MyStyle.button_user}
          mode="contained"
          onPress={addComment}
        >
          Bình luận
        </Button>
      </View>
    </View>
  );
};

export default Comments;
