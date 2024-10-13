import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { authApi, endpoints } from "../../configs/APIs";
import {
  ActivityIndicator,
  Searchbar,
  Snackbar,
  Modal,
  Portal,
  Text,
  Button,
  PaperProvider,
} from "react-native-paper";
import MyStyle from "../../styles/MyStyle";
import Styles from "../General/Styles";
import { Row, Table } from "react-native-table-component";
import AntDesign from "react-native-vector-icons/AntDesign";
import Icon from "react-native-vector-icons/FontAwesome";
import moment from "moment";
import { MyUserContext } from "../../configs/Contexts";

const RegisterStudy = () => {
  const user = useContext(MyUserContext);

  const [loading, setLoading] = useState(false);
  const [studyClassRooms, setStudyClassRooms] = useState([]);
  const [page, setPage] = useState(1);
  const [kw, setKw] = useState("");
  const [visible, setVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [widthArr, setWidthArr] = useState([40, 400, 100]);
  const tableHead = [
    "Stt",
    "Mã môn học",
    "Tên môn học",
    "Nhóm",
    "Ngày đăng ký",
    "Trạng thái",
    "Thời gian học",
  ];

  const showModal = () => {
    loadListRegistered();
    setVisible(true);
  };
  const hideModal = () => setVisible(false);
  const containerStyle = { backgroundColor: "white", padding: 20 };
  const [registerd, setRegisterd] = useState([]);

  const formatDateTime = (datetimeString) => {
    return moment(datetimeString).format("DD/MM/YYYY - HH:mm:ss");
  };
  const formatDate = (dateString) => {
    return moment(dateString).format("DD/MM/YYYY");
  };

  const loadStudyClassRooms = async () => {
    if (page <= 0) return;

    try {
      setLoading(true);
      let url = `${endpoints["list-studyclassrooms-for-register"](
        user.id
      )}?page=${page}`;
      if (kw) url += `&kw=${kw}`;

      const res = await authApi(user.access_token).get(url);
      setStudyClassRooms((prev) =>
        page === 1 ? res.data.results : [...prev, ...res.data.results]
      );
      if (!res.data.next) setPage(0); // No more pages to load
    } catch (error) {
      setSnackbarMessage(
        error.response?.data?.message || "An unexpected error occurred."
      );
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const loadListRegistered = async () => {
    try {
      setLoading(true);
      let url = `${endpoints["list-registered"](user.id)}`;
      const res = await authApi(user.access_token).get(url);
      setRegisterd(res.data.results);
      setWidthArr([40, 100, 100, 60, 100, 90, 100]);
      // console.log(registerd);
    } catch (error) {
      setSnackbarMessage(
        error.response?.data?.message || "An unexpected error occurred."
      );
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const delRegistered = async (study_id) => {
    try {
      setLoading(true);
      let url = `${endpoints["del-registered"](study_id)}`;
      const res = await authApi(user.access_token).delete(url);
      Alert.alert("success", res.data.message);
      loadListRegistered();
    } catch (error) {
      setSnackbarMessage(
        error.response?.data?.message || "An unexpected error occurred."
      );
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 100;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  const loadMore = ({ nativeEvent }) => {
    if (!loading && isCloseToBottom(nativeEvent) && page > 0) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    loadStudyClassRooms();
  }, [page, kw]);

  const handleSearchChange = (value) => {
    setPage(1);
    setKw(value);
  };

  const registerStudy = async (studyclassroom_id) => {
    try {
      setLoading(true);
      const url = `${endpoints["register-study"](studyclassroom_id)}`;
      const res = await authApi(user.access_token).post(url, {
        student_id: user.id,
      });
      Alert.alert("Success", res.data.message);
      setPage(1); // Reset page after registration
    } catch (error) {
      setSnackbarMessage(
        error.response?.data?.message || "Failed to register study."
      );
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider>
      <View style={MyStyle.container}>
        {studyClassRooms.length > 0 ? (
          <>
            <Searchbar
              onChangeText={handleSearchChange}
              value={kw}
              placeholder="Tìm theo kiếm môn học"
            />
            <Button
              style={MyStyle.button_check_result_register}
              mode="contained"
              onPress={showModal}
            >
              Xem kết quả đăng ký môn học
            </Button>
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
                <TouchableOpacity key={c.id}>
                  <View style={Styles.class}>
                    <Text style={Styles.text_class}>Lớp: {c.name}</Text>
                    <Text style={Styles.text_class}>
                      Mã Môn: {c.subject_code}
                    </Text>
                    <Text style={Styles.text_class}>
                      Tên Môn: {c.subject_name}
                    </Text>
                    <Text style={Styles.text_class}>Nhóm: {c.group_name}</Text>
                    <Text style={Styles.text_class}>
                      Học kỳ: {c.semester_name}
                    </Text>
                    <Text style={Styles.text_class}>
                      Năm Học: {c.semester_year}
                    </Text>
                    <Text style={Styles.text_class}>
                      Giảng viên: {c.teacher_name}
                    </Text>
                    <Text style={Styles.text_class}>
                      Ngày Bắt Đầu: {formatDate(c.started_date)}
                    </Text>
                    <Text style={Styles.text_class}>
                      Ngày Kết Thúc: {formatDate(c.ended_date)}
                    </Text>
                    <Text style={[Styles.text_class, Styles.text_red_color]}>
                      Sỉ số hiện tại:{" "}
                      {c.isregister
                        ? c.total_student + "/90 (Sinh Viên)"
                        : "Đã đủ sỉ số"}
                    </Text>
                    <Button
                      style={MyStyle.button_user}
                      mode="contained"
                      onPress={() => registerStudy(c.id)}
                    >
                      Đăng Ký
                    </Button>
                  </View>
                </TouchableOpacity>
              ))}
              {loading && page > 1 && <ActivityIndicator />}
            </ScrollView>
          </>
        ) : (
          <Text>Ngoài thời gian đăng ký môn học !!!</Text>
        )}

        <Portal>
          <Modal
            visible={visible}
            onDismiss={hideModal}
            contentContainerStyle={containerStyle}
          >
            {registerd.length === 0 ? (
              <>
                <Text>Chưa có kết quả đăng ký môn học</Text>
              </>
            ) : (
              <>
                <ScrollView horizontal={true}>
                  <View style={MyStyle.table}>
                    <Table
                      borderStyle={{ borderWidth: 1, borderColor: "#000" }}
                    >
                      <Row
                        data={[...tableHead, "Hành động"]}
                        style={MyStyle.head}
                        textStyle={{ ...MyStyle.text, fontWeight: "bold" }}
                        widthArr={[...widthArr, 100]}
                      />
                      {registerd.length > 0 ? (
                        registerd.map((c, index) => (
                          <Row
                            key={index + 1}
                            data={[
                              index + 1,
                              c.subject_code,
                              c.subject_name,
                              c.group_name,
                              formatDateTime(c.created_date),
                              c.active ? (
                                <AntDesign
                                  name="checkcircle"
                                  size={20}
                                  color="green"
                                />
                              ) : (
                                <AntDesign
                                  name="closecircle"
                                  size={20}
                                  color="red"
                                />
                              ),
                              formatDate(c.started_date) +
                                " - " +
                                formatDate(c.ended_date),

                              // Add delete button here
                              <TouchableOpacity
                                style={MyStyle.button_del}
                                onPress={() =>
                                  Alert.alert(
                                    "Xác Nhận Xoá:",
                                    "Bạn có muốn xoá môn học đã đăng ký này không học này hay không?",
                                    [
                                      {
                                        text: "Huỷ",
                                        style: "cancel",
                                      },
                                      {
                                        text: "Đồng Ý",
                                        onPress: () => delRegistered(c.id),
                                        style: "destructive",
                                      },
                                    ]
                                  )
                                }
                              >
                                <Icon name="trash" size={22} color="#fff" />
                                <Text style={MyStyle.buttonText_del}>Xoá</Text>
                              </TouchableOpacity>,
                            ]}
                            style={MyStyle.body}
                            textStyle={MyStyle.text}
                            widthArr={[...widthArr, 100]} // Add width for the delete button column
                          />
                        ))
                      ) : (
                        <Row
                          data={[
                            "",
                            "",
                            "",
                            ...Array(scoreTypes.length).fill(""),
                          ]}
                          style={MyStyle.body}
                          textStyle={MyStyle.text}
                          widthArr={widthArr}
                        />
                      )}
                    </Table>
                  </View>
                </ScrollView>
              </>
            )}

            <Button mode="contained" onPress={hideModal}>
              Đóng
            </Button>
          </Modal>
        </Portal>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    </PaperProvider>
  );
};

export default RegisterStudy;
