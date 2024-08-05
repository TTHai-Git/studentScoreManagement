import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { authApi, endpoints } from "../../configs/APIs";
import MyStyle from "../../styles/MyStyle";
import Styles from "../General/Styles";
import moment from "moment";
import * as DocumentPicker from "expo-document-picker";
import {
  Avatar,
  Button,
  TextInput,
  Card,
  IconButton,
} from "react-native-paper";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";

const Comments = ({ navigation, route }) => {
  const topic_id = route.params?.topic_id;
  const token = route.params?.token;

  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [commentfiles, setCommentFiles] = useState([]);

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

  useEffect(() => {
    loadComments();
  }, [page]);

  const loadFilesOfComments = async (reset = false) => {
    if (reset) {
      setPage(1);
    }
    if (page > 0) {
      try {
        setLoading(true);
        const url = `${endpoints["commentfiles"]}?page=${page}`;
        const res = await authApi(token).get(url);
        if (page === 1) {
          setCommentFiles(res.data.results);
        } else {
          setCommentFiles((current) => [...current, ...res.data.results]);
        }
        if (res.data.next === null) setPage(0);
      } catch (ex) {
        console.error(ex);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadFilesOfComments();
  }, [page]);

  const selectFiles = async () => {
    try {
      const results = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
      });

      if (results.canceled !== "true") {
        const validFiles = results.assets.filter((file) => {
          const fileSizeInMB = file.size / (1024 * 1024); // Convert bytes to MB
          if (fileSizeInMB > 2) {
            Alert.alert(
              "File too large",
              `${file.name} is larger than 2MB and won't be selected.`
            );
            return false;
          }
          return true;
        });

        setSelectedFiles(validFiles);
      }
    } catch (err) {
      console.log("Error picking files: ", err);
    }
  };

  const addComment = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("content", content);

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
      setSelectedFiles([]);
      loadComments(true);
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        Alert.alert("Error", ex.response.data.message);
      } else {
        console.log("Unexpected error: ", ex);
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (url, fileName) => {
    try {
      const result = await FileSystem.downloadAsync(
        url,
        FileSystem.documentDirectory + fileName
      );
      console.log(result);
      await saveFile(result.uri, fileName, result.headers["content-type"]);
    } catch (error) {
      console.log("Error downloading file:", error);
    }
  };

  const saveFile = async (uri, filename, minetype) => {
    if (Platform.OS === "android") {
      try {
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const newUri =
            await FileSystem.StorageAccessFramework.createFileAsync(
              permissions.directoryUri,
              filename,
              minetype
            );
          await FileSystem.writeAsStringAsync(newUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } else {
          await shareAsync(uri);
        }
      } catch (error) {
        console.log("Error saving file on Android:", error);
      }
    } else {
      try {
        await shareAsync(uri);
      } catch (error) {
        console.log("Error sharing file on iOS:", error);
      }
    }
  };

  const shareAsync = async (uri) => {
    try {
      await Share.share({
        url: uri,
      });
    } catch (error) {
      console.log("Error sharing file:", error);
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

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadComments(true).then(() => setRefreshing(false));
  };

  return (
    <View style={[MyStyle.container, { padding: 10 }]}>
      <ScrollView
        onScroll={loadMore}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && page === 1 && <ActivityIndicator />}
        {comments.map((c) => (
          <Card key={c.id} style={{ marginBottom: 10 }}>
            <Card.Title
              title={`${c.user.last_name} ${c.user.first_name}`}
              subtitle={moment(c.created_date).fromNow()}
              left={(props) => (
                <Avatar.Image
                  {...props}
                  size={40}
                  source={{ uri: c.user.avatar }}
                />
              )}
            />
            <Card.Content>
              <Text style={{ marginBottom: 10 }}>{c.content}</Text>
              {commentfiles
                .filter((cf) => cf.comment_id === c.id)
                .map((cf) => (
                  <Button
                    key={cf.id}
                    icon="file-download"
                    mode="outlined"
                    onPress={() => downloadFile(cf.file_url, cf.file_name)}
                  >
                    {cf.file_name}
                  </Button>
                ))}
            </Card.Content>
          </Card>
        ))}
        {loading && page > 1 && <ActivityIndicator />}
      </ScrollView>
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
          placeholder="Viết bình luận"
          value={content}
          onChangeText={(t) => setContent(t)}
          style={{
            marginBottom: 10,
            backgroundColor: "#f4f4f4",
            borderRadius: 5,
          }}
        />
        <Button
          icon="paperclip"
          mode="contained"
          style={{ marginBottom: 10 }}
          onPress={selectFiles}
        >
          Chọn tệp
        </Button>
        {selectedFiles.length > 0 && (
          <Text style={{ marginBottom: 10 }}>
            Các file đã chọn:{" "}
            {selectedFiles.map((file) => file.name).join(", ")}
          </Text>
        )}
        <Button mode="contained" onPress={addComment}>
          Bình luận
        </Button>
      </View>
    </View>
  );
};

export default Comments;
