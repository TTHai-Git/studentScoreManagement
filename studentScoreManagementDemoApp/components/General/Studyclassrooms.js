import React, { useContext, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert, // Added for handling error messages
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
import Icon from "react-native-vector-icons/FontAwesome"; // Import FontAwesome icons
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "react-native-vector-icons/AntDesign";
import moment from "moment";
import { MyUserContext } from "../../configs/Contexts";

const StudyClassRooms = ({ navigation, route }) => {
  const user = useContext(MyUserContext);

  const [loading, setLoading] = useState(false);
  const [studyClassRooms, setStudyClassRooms] = useState([]);
  const [studyclassroom_id, setStudyClassroom_id] = useState(null);
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState(1);

  const [semester, setSemester] = useState(null);
  const [data, setData] = useState([]);
  const [value, setValue] = useState(null);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const formatDate = (dateString) => {
    return moment(dateString).format("DD/MM/YYYY");
  };

  const loadStudyClassRooms = async () => {
    if (page > 0) {
      try {
        setLoading(true);

        // Update the URL to match the new API and filter by semester
        let url = ``;
        if (user.role === "teacher")
          url = `${endpoints["studyclassroomsofteacher"](
            user.id
          )}?page=${page}`;
        if (user.role === "student")
          url = `${endpoints["studyclassroomsofstudent"](
            user.id
          )}?page=${page}`;
        if (semester && semester !== "Show All") {
          url += `&semester=${semester}`;
        }

        let res = await authApi(user.access_token).get(url);

        if (page === 1) {
          setStudyClassRooms(res.data.results); // Initial load
        } else {
          setStudyClassRooms((current) => [...current, ...res.data.results]); // Append new results for pagination
        }

        // If no more pages, set page to 0 (or consider a flag like hasMore)
        if (!res.data.next) {
          setPage(0); // Or consider setHasMore(false);
        }
      } catch (error) {
        console.log("Error:", error); // Log the full error for more debugging info
        if (error.response && error.response.data) {
          Alert.alert("Error", error.response.data.message);
        } else {
          Alert.alert("Error", "An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const loadSemester = async () => {
    try {
      const url = `${endpoints["list-semester"]}`;
      const res = await authApi(user.access_token).get(url);
      // console.log(res.data.results);
      const arr = res.data.results.map((item) => ({
        label: item.name + " " + item.year,
        value: item.name + " " + item.year,
      }));
      arr.push({
        label: "Show All",
        value: "Show All",
      });
      setData(arr);
    } catch (error) {
      console.log(error.response);
      if (error.response && error.response.data) {
        Alert.alert("Error", error.response.data.message);
      } else {
        Alert.alert("Error", "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderItem = (item) => {
    return (
      <View style={MyStyle.item}>
        <Text style={MyStyle.textItem}>{item.label}</Text>
        {item.value === semester && (
          <AntDesign
            style={MyStyle.icon}
            color="black"
            name="Safety"
            size={20}
          />
        )}
      </View>
    );
  };

  const handleItemChange = (item) => {
    setSemester(item.value);
    setPage(1); // Reset page when semester changes
    loadStudyClassRooms(); // Reload data with new semester
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
    });
  };

  const goListStudentScores = () => {
    navigation.navigate("ListStudentScores", {
      studyclassroom_id: studyclassroom_id,
    });
  };

  const goListStudents = () => {
    navigation.navigate("ListStudents", {
      studyclassroom_id: studyclassroom_id,
    });
  };

  useEffect(() => {
    loadStudyClassRooms();
  }, [page, semester]); // Watch for page changes

  useEffect(() => {
    loadSemester();
  }, []);

  return (
    <Provider>
      <View style={MyStyle.container}>
        <Dropdown
          style={MyStyle.dropdown}
          placeholderStyle={MyStyle.placeholderStyle}
          selectedTextStyle={MyStyle.selectedTextStyle}
          inputSearchStyle={MyStyle.inputSearchStyle}
          iconStyle={MyStyle.iconStyle}
          data={data}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Chọn học kỳ và năm học..."
          searchPlaceholder="Search..."
          value={value}
          onChange={(item) => {
            handleItemChange(item);
          }}
          renderLeftIcon={() => (
            <AntDesign
              style={MyStyle.icon}
              color="black"
              name="Safety"
              size={20}
            />
          )}
          renderItem={renderItem}
        />
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
                    icon={() => <Icon name="users" size={20} color="white" />} // Icon for "View Student List"
                    style={MyStyle.button_user}
                    mode="contained"
                    onPress={goListStudents}
                  >
                    Điểm danh
                  </Button>
                  <Button
                    icon={() => (
                      <Icon name="check-square" size={20} color="white" />
                    )} // Icon for "Manage Scores"
                    style={MyStyle.button_user}
                    mode="contained"
                    onPress={goListStudentScores}
                  >
                    Quản lý điểm
                  </Button>
                  <Button
                    icon={() => (
                      <Icon name="comments" size={20} color="white" />
                    )} // Icon for "Forum"
                    style={MyStyle.button_user}
                    mode="contained"
                    onPress={goTopics}
                  >
                    Diễn đàn
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    icon={() => (
                      <Icon name="comments" size={20} color="white" />
                    )} // Icon for "Forum"
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

        {studyClassRooms.length === 0 && !loading ? (
          <View style={Styles.centered}>
            <Text>Không có lớp học nào !!!</Text>
          </View>
        ) : (
          <ScrollView
            onScroll={loadMore}
            scrollEventThrottle={400}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={() => {
                  setPage(1); // Reset page to refresh the data
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
                      description={`Môn: ${c.subject_code} - ${c.subject_name}`}
                      left={(props) => <List.Icon {...props} icon="school" />}
                    />
                    <Paragraph>Nhóm: {c.group_name}</Paragraph>
                    <Paragraph>Học Kỳ: {c.semester_name}</Paragraph>
                    <Paragraph>Năm Học: {c.semester_year}</Paragraph>
                    <Paragraph>Giảng viên: {c.teacher_name}</Paragraph>
                    <Paragraph>
                      Ngày Bắt Đầu: {formatDate(c.started_date)}
                    </Paragraph>
                    <Paragraph>
                      Ngày Kết Thúc: {formatDate(c.ended_date)}
                    </Paragraph>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        {loading && page > 1 && <ActivityIndicator size="large" />}
      </View>
    </Provider>
  );
};

export default StudyClassRooms;
