import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { authApi, endpoints } from "../../configs/APIs";
import {
  ActivityIndicator,
  Button,
  List,
  Modal,
  Portal,
  Provider,
} from "react-native-paper";
import MyStyle from "../../styles/MyStyle";
import Styles from "../General/Styles";

const StudyClassRooms = ({ navigation, route }) => {
  let token = route.params?.token;
  let user = route.params?.user;

  const [loading, setLoading] = useState(false);
  const [studyClassRooms, setStudyClassRooms] = useState([]);
  const [studyclassroom_id, setStudyClassroom_id] = useState(null);
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState(1);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const loadStudyClassRooms = async () => {
    if (page > 0) {
      try {
        setLoading(true);
        let url = "";
        if (user.role === "teacher") {
          url = `${endpoints["studyclassrooms"]}?page=${page}`;
        } else {
          url = `${endpoints["studyclassroomsofstudent"](
            user.id
          )}?page=${page}`;
        }
        let res = await authApi(token).get(url);
        console.log(res.data);
        if (page === 1) {
          setStudyClassRooms(res.data.results);
        } else {
          setStudyClassRooms((current) => [...current, ...res.data.results]);
        }
        if (res.data.next === null) {
          setPage(0);
        }
      } catch (ex) {
        // console.error(ex);
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

  const goTopics = () => {
    navigation.navigate("Topics", {
      studyclassroom_id: studyclassroom_id,
      token: token,
      user: user,
    });
  };

  const goChatRoom = () => {
    navigation.navigate("Chat", {
      studyclassroom_id: studyclassroom_id,
      token: token,
      user: user,
    });
  };

  const goListStudentScores = () => {
    navigation.navigate("ListStudentScores", {
      studyclassroom_id: studyclassroom_id,
      token: token,
      user: user,
    });
  };

  const goListStudents = () => {
    navigation.navigate("ListStudents", {
      studyclassroom_id: studyclassroom_id,
      token: token,
      user: user,
    });
  };

  useEffect(() => {
    loadStudyClassRooms();
  }, [page]);

  return (
    <Provider>
      <View style={MyStyle.container}>
        <View>
          <Portal>
            <Modal
              visible={visible}
              onDismiss={hideModal}
              contentContainerStyle={MyStyle.modal}
            >
              <View>
                {user.role === "teacher" ? (
                  <>
                    <Button
                      style={MyStyle.button_user}
                      mode="contained"
                      onPress={goListStudents}
                    >
                      Xem danh sách sinh viên
                    </Button>
                    <Button
                      style={MyStyle.button_user}
                      mode="contained"
                      onPress={goListStudentScores}
                    >
                      Quản lý điểm
                    </Button>
                    <Button
                      style={MyStyle.button_user}
                      mode="contained"
                      onPress={goTopics}
                    >
                      Diễn đàn
                    </Button>
                    <Button
                      style={MyStyle.button_user}
                      mode="contained"
                      onPress={goChatRoom}
                    >
                      Phòng Chat
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      style={MyStyle.button_user}
                      mode="contained"
                      onPress={goTopics}
                    >
                      Diễn đàn
                    </Button>
                    <Button
                      style={MyStyle.button_user}
                      mode="contained"
                      onPress={goChatRoom}
                    >
                      Phòng Chat
                    </Button>
                  </>
                )}
              </View>
            </Modal>
          </Portal>
          {studyClassRooms.length > 0 ? (
            <ScrollView
              onScroll={loadMore}
              scrollEventThrottle={400}
              refreshControl={
                <RefreshControl
                  refreshing={loading}
                  onRefresh={loadStudyClassRooms}
                />
              }
            >
              {studyClassRooms.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => {
                    showModal();
                    setStudyClassroom_id(c.id);
                  }}
                >
                  <View style={Styles.class}>
                    <Text style={Styles.text_class}>Lớp: {c.name}</Text>
                    <Text style={Styles.text_class}>Môn: {c.subject_name}</Text>
                    <Text style={Styles.text_class}>Nhóm: {c.group_name}</Text>
                    <Text style={Styles.text_class}>
                      Học kỳ_Năm Học: {c.semester_name}_{c.semester_year}{" "}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              {loading && page > 1 && <ActivityIndicator />}
            </ScrollView>
          ) : (
            <Text>Không tìm thấy lớp học nào!!!</Text>
          )}
        </View>
      </View>
    </Provider>
  );
};

export default StudyClassRooms;
