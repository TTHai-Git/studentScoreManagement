import React, { useEffect, useState, useCallback, useContext } from "react";
import {
  Alert,
  ScrollView,
  View,
  ActivityIndicator,
  TextInput,
  Text,
} from "react-native";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import MyStyle from "../../styles/MyStyle";
import { Button, Provider, Searchbar } from "react-native-paper";
import Styles from "../Teacher/Styles";
import { Row, Table } from "react-native-table-component";
import Icon from "react-native-vector-icons/FontAwesome"; // Importing FontAwesome icons
import { MyUserContext } from "../../configs/Contexts";
import moment from "moment";

const ListStudents = ({ navigation, route }) => {
  const user = useContext(MyUserContext);
  const studyclassroom_id = route.params?.studyclassroom_id;

  const [loading, setLoading] = useState(false);
  const [scheduleColumns, setScheduleColumns] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [kw, setKw] = useState("");
  const [visible, setVisible] = useState(false);

  const formatDate = (datetimeString) => {
    return moment(datetimeString).format("DD/MM/YYYY");
  };

  const calculateTotalPresentInColumn = (col_id) => {
    let total = 0;
    statuses.forEach((status) => {
      const studentStatus = status.statuses.find(
        (e) => e.schedule_id == col_id
      )?.status;
      if (studentStatus === "X") {
        total += 1;
      }
    });
    return total + "/" + statuses.length + " Sinh Viên";
  };

  const loadAttendOfStudyClassRoom = useCallback(async () => {
    try {
      setLoading(true);
      let url = `${endpoints["attends"](studyclassroom_id)}`;
      if (kw) {
        url += `?kw=${kw}`;
      }
      let res = await authApi(user.access_token).get(url);
      setStatuses(res.data.schedules_with_statuses.attend_details);
      setScheduleColumns(res.data.schedules_with_statuses.schedule_cols);
    } catch (error) {
      if (error.response && error.response.status) {
        Alert.alert("Error", error.response.data.message);
      } else {
        console.log("Unexpected error: ", error);
        Alert.alert("Error", "Chưa có danh sách sinh viên");
      }
    } finally {
      setLoading(false);
    }
  }, [studyclassroom_id, user.access_token, kw]);

  useEffect(() => {
    loadAttendOfStudyClassRoom();
  }, [loadAttendOfStudyClassRoom]);

  const search = (value) => {
    setKw(value);
    loadAttendOfStudyClassRoom(); // Trigger search on keyword change
  };

  const tableHead = [
    "STT",
    "MSSV",
    "Email",
    "Họ Và Tên",
    ...scheduleColumns.map((col) => `${formatDate(col.started_time)}`),
    "Có Mặt",
  ];
  const widthArr = [40, 100, 200, 200, ...scheduleColumns.map(() => 120), 120];

  const handleChangeStatus = (student_id, col_id, value) => {
    const newStatuses = statuses.map((status) => {
      if (status.student_id === student_id) {
        const updatedStatuses = status.statuses.map((s) => {
          if (s.schedule_id === col_id) {
            return { ...s, status: value };
          }
          return s;
        });
        return { ...status, statuses: updatedStatuses };
      }
      return status;
    });
    setStatuses(newStatuses);
  };

  const handleSaveStatuses = async () => {
    setLoading(true);
    try {
      let url = `${endpoints["save-attends"](studyclassroom_id)}`;
      let res = await authApi(user.access_token).post(url, {
        attends: statuses,
      });
      Alert.alert("Success", res.data.message);
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

  const calculateTotalAttended = (studentStatuses) => {
    return studentStatuses.filter((status) => status.status === "X").length;
  };

  return (
    <Provider>
      <View style={[MyStyle.container, MyStyle.centerContainer]}>
        {statuses.length > 0 ? (
          <>
            <Searchbar
              onChangeText={search}
              value={kw}
              placeholder="Tìm theo từ khóa"
            />
            <ScrollView horizontal={true} vertical={true}>
              <View style={MyStyle.table}>
                {loading ? (
                  <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                  <Table borderStyle={{ borderWidth: 1, borderColor: "#000" }}>
                    <Row
                      data={tableHead}
                      style={MyStyle.head}
                      textStyle={{ ...MyStyle.text, fontWeight: "bold" }}
                      widthArr={widthArr}
                    />
                    {statuses.length > 0 ? (
                      statuses.map((status, index) => (
                        <Row
                          key={index + 1}
                          data={[
                            index + 1,
                            status.student_code,
                            status.student_email,
                            status.student_name,
                            ...scheduleColumns.map((col) => {
                              const s = status.statuses.find(
                                (e) => e.schedule_id == col.id
                              )?.status;

                              return (
                                <View
                                  key={col.id}
                                  style={MyStyle.inputContainer}
                                >
                                  <TextInput
                                    value={s ? s.toString() : ""}
                                    style={{
                                      fontSize: 15,
                                      textAlign: "center",
                                    }}
                                    onChangeText={(text) => {
                                      handleChangeStatus(
                                        status.student_id,
                                        col.id,
                                        text
                                      );
                                    }}
                                    keyboardType="default"
                                  />
                                  <View style={MyStyle.noteContainer}>
                                    <Text style={MyStyle.noteText}>
                                      X=Có Mặt, V=Vắng Mặt
                                    </Text>
                                  </View>
                                </View>
                              );
                            }),
                            calculateTotalAttended(status.statuses) +
                              "/" +
                              scheduleColumns.length +
                              " Buổi",
                          ]}
                          style={MyStyle.body}
                          textStyle={MyStyle.text}
                          widthArr={widthArr}
                        />
                      ))
                    ) : (
                      <Row
                        data={[
                          "",
                          "",
                          "",
                          "",
                          ...scheduleColumns.map(() => ""),
                        ]}
                        style={MyStyle.body}
                        textStyle={MyStyle.text}
                        widthArr={widthArr}
                      />
                    )}
                    {/* Row to display total present in each column */}
                    <Row
                      data={[
                        "Tổng Cộng Có Mặt", // Merged cell label for total present
                        "", // Empty cell for MSSV
                        "", // Empty cell for Họ và tên
                        "", // Empty cell for Email
                        ...scheduleColumns.map((col) =>
                          calculateTotalPresentInColumn(col.id)
                        ), // Display total present for each schedule column
                        "", // Empty cell for the last column (Total Attended)
                      ]}
                      style={MyStyle.head}
                      textStyle={{
                        ...MyStyle.text,
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                      widthArr={[
                        537,
                        0,
                        0,
                        0,
                        ...scheduleColumns.map(() => 120),
                        120,
                      ]} // Set width for merged cells
                    />
                  </Table>
                )}
              </View>
            </ScrollView>
            <View style={Styles.button_score}>
              <Button
                icon={() => <Icon name="save" size={20} color="white" />}
                style={MyStyle.button_user}
                mode="contained"
                onPress={handleSaveStatuses}
              >
                Lưu nháp
              </Button>
            </View>
          </>
        ) : (
          <>
            <Text>Chưa có sinh viên nào đăng ký vào lớp học này</Text>
          </>
        )}
      </View>
    </Provider>
  );
};

export default ListStudents;
