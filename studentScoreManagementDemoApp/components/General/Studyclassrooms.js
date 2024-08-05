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
  Card,
  Paragraph,
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
        if (page === 1) {
          setStudyClassRooms(res.data.results);
        } else {
          setStudyClassRooms((current) => [...current, ...res.data.results]);
        }
        if (res.data.next === null) {
          setPage(0);
        }
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

  const goTopics = () => {
    navigation.navigate("Topics", {
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

  const goNewSchedule = () => {
    navigation.navigate("Schedule", {
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
                    onPress={goNewSchedule}
                  >
                    Tạo Lịch học
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
                onRefresh={() => {
                  setPage(1);
                  loadStudyClassRooms();
                }}
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
                <Card style={{ marginBottom: 10 }}>
                  <Card.Content>
                    <List.Item
                      title={`Lớp: ${c.name}`}
                      description={`Môn: ${c.subject_name}`}
                      left={(props) => <List.Icon {...props} icon="school" />}
                    />
                    <Paragraph>Nhóm: {c.group_name}</Paragraph>
                    <Paragraph>Học kỳ: {c.semester_name}</Paragraph>
                    <Paragraph>Năm Học: {c.semester_year}</Paragraph>
                    <Paragraph>Giảng viên: {c.teacher_name}</Paragraph>
                    <Paragraph>Ngày Bắt Đầu: {c.started_date}</Paragraph>
                    <Paragraph>Ngày Kết Thúc: {c.ended_date}</Paragraph>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))}
            {loading && page > 1 && <ActivityIndicator />}
          </ScrollView>
        ) : (
          <View style={Styles.centered}>
            <Text>Không tìm thấy lớp học nào!!!</Text>
          </View>
        )}
      </View>
    </Provider>
  );
};

export default StudyClassRooms;
