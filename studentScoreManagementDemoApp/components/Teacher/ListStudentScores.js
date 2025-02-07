import React, { useEffect, useState, useCallback, useContext } from "react";
import {
  Alert,
  ScrollView,
  View,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  Text,
} from "react-native";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import MyStyle from "../../styles/MyStyle";
import {
  Button,
  DataTable,
  Dialog,
  Modal,
  Portal,
  Provider,
  Searchbar,
} from "react-native-paper";
import Styles from "../Teacher/Styles";
import { Row, Table } from "react-native-table-component";
import Icon from "react-native-vector-icons/FontAwesome"; // Importing FontAwesome icons
import { MyUserContext } from "../../configs/Contexts";

const ListStudentScores = ({ navigation, route }) => {
  const user = useContext(MyUserContext);
  const studyclassroom_id = route.params?.studyclassroom_id;

  const [loading, setLoading] = useState(false);
  const [scoreColumns, setScoreColumns] = useState([]);
  const [scores, setScores] = useState([]);
  const [kw, setKw] = useState("");
  const [visible, setVisible] = useState(false);
  const [lockStatus, setLockStatus] = useState(false);
  const [isHandlingLockScore, setIsHandlingLockScore] = useState(false);
  const [lockDialogVisible, setLockDialogVisible] = useState(false);
  const [isLocking, setIsLocking] = useState(false); // To indicate if locking or unlocking

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const showLockDialog = (isLockingAction) => {
    setIsLocking(isLockingAction); // Set whether we're locking or unlocking
    setLockDialogVisible(true);
  };

  const hideLockDialog = () => {
    setLockDialogVisible(false);
  };

  const loadScoresOfStudyClassRoom = useCallback(async () => {
    try {
      setLoading(true);
      let url = `${endpoints["scores"](studyclassroom_id)}`;
      if (kw) {
        url += `?kw=${kw}`;
      }
      let res = await authApi(user.access_token).get(url);
      setScores(res.data.scoredetails_with_scores.score_details);
      setScoreColumns(res.data.scoredetails_with_scores.score_cols);
    } catch (error) {
      if (error.response) {
        Alert.alert("Error", error.response.data.message);
      } else {
        console.log("Unexpected error: ", error);
        Alert.alert("Error", "Failed to load Scores of StudyClassrooms.");
      }
    } finally {
      setLoading(false);
    }
  }, [studyclassroom_id, user.access_token, kw]);

  useEffect(() => {
    loadScoresOfStudyClassRoom();
  }, [loadScoresOfStudyClassRoom]);

  const getLockedScoreStatus = useCallback(async () => {
    try {
      let url = `${endpoints["check-locked-scored-studyclassroom"](
        studyclassroom_id
      )}`;
      let res = await authApi(user.access_token).get(url);
      setLockStatus(res.data.islock);
      // console.log(res.data.islock);
    } catch (ex) {
      console.error(ex);
      Alert.alert("Error", "Failed to check lock status.");
    }
  }, [studyclassroom_id, user.access_token]);

  useEffect(() => {
    getLockedScoreStatus();
  }, [getLockedScoreStatus]);

  const lockScoreOfStudyClassRoom = async () => {
    try {
      let url = `${endpoints["lock_or_unlock_scores_of_studyclassroom"](
        studyclassroom_id
      )}`;
      setIsHandlingLockScore(true);
      let res = await authApi(user.access_token).patch(url);
      Alert.alert("Success", res.data.message);
      setLockStatus(!lockStatus);
    } catch (ex) {
      console.error(ex);
      Alert.alert("Error", "Failed to lock/unlock scores.");
    } finally {
      setIsHandlingLockScore(false);
    }
  };

  const exportScoresCSV = async () => {
    try {
      let url = `${endpoints["export-csv-scores"](studyclassroom_id)}`;
      let res = await authApi(user.access_token).get(url);
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

  const exportScoresPDF = async () => {
    try {
      let url = `${endpoints["export-pdf-scores"](studyclassroom_id)}`;
      let res = await authApi(user.access_token).get(url);
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

  const search = (value) => {
    setKw(value);
  };

  const tableHead = [
    "STT",
    "MSSV",
    "Họ Và Tên",
    ...scoreColumns.map((col) => `${col.type}`),
  ];
  const widthArr = [40, 100, 200, ...scoreColumns.map(() => 120)];

  const handleChangeScore = (student_id, col_id, value) => {
    const newScores = scores.map((score) => {
      if (score.student_id === student_id) {
        const updatedScores = score.scores.map((s) => {
          if (s.col_id === col_id) {
            return { ...s, score: value };
          }
          return s;
        });
        return { ...score, scores: updatedScores };
      }
      return score;
    });
    setScores(newScores);
  };

  const handleSaveScore = async () => {
    setLoading(true);
    try {
      let url = `${endpoints["save-scores"](studyclassroom_id)}`;
      let res = await authApi(user.access_token).post(url, {
        scores: scores,
      });
      // console.log(res.data);
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

  return (
    <Provider>
      <View style={[MyStyle.container, MyStyle.centerContainer]}>
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
                {scores.length > 0 ? (
                  scores.map((score, index) => (
                    <Row
                      key={index + 1}
                      data={[
                        index + 1,
                        score.student_code,
                        score.student_name,
                        ...scoreColumns.map((col) => {
                          const s = score.scores.find(
                            (e) => e.col_id == col.id
                          )?.score;

                          return (
                            <TextInput
                              key={col.id}
                              value={s ? s.toString() : ""}
                              style={{ fontSize: 15, textAlign: "center" }}
                              onChangeText={(text) => {
                                handleChangeScore(
                                  score.student_id,
                                  col.id,
                                  text
                                );
                              }}
                              keyboardType="numeric"
                            />
                          );
                        }),
                      ]}
                      style={MyStyle.body}
                      textStyle={MyStyle.text}
                      widthArr={widthArr}
                    />
                  ))
                ) : (
                  <Row
                    data={["", "", "", "", ...scoreColumns.map(() => "")]}
                    style={MyStyle.body}
                    textStyle={MyStyle.text}
                    widthArr={widthArr}
                  />
                )}
              </Table>
            )}
          </View>
        </ScrollView>
        <Portal>
          <Modal
            visible={visible}
            onDismiss={hideModal}
            contentContainerStyle={MyStyle.modal}
          >
            <View>
              <Button
                icon={() => <Icon name="file-pdf-o" size={20} color="white" />}
                style={MyStyle.button_user}
                mode="contained"
                onPress={exportScoresPDF}
              >
                Xuất file điểm PDF
              </Button>
              <Button
                icon={() => <Icon name="file-text-o" size={20} color="white" />}
                style={MyStyle.button_user}
                mode="contained"
                onPress={exportScoresCSV}
              >
                Xuất file điểm CSV
              </Button>
            </View>
          </Modal>
        </Portal>
        <View style={Styles.button_score}>
          <Button
            icon={() => (
              <Icon
                name={lockStatus ? "unlock" : "lock"}
                size={20}
                color="white"
              />
            )}
            disabled={isHandlingLockScore}
            style={MyStyle.button_user}
            mode="contained"
            onPress={() => showLockDialog(lockStatus)} // Show confirmation dialog
          >
            {lockStatus ? "Mở khóa điểm" : "Khóa điểm"}
          </Button>
          <Button
            icon={() => <Icon name="save" size={20} color="white" />}
            style={MyStyle.button_user}
            mode="contained"
            onPress={handleSaveScore}
          >
            Lưu nháp
          </Button>
          <Button
            icon={() => <Icon name="download" size={20} color="white" />}
            style={MyStyle.button_user}
            mode="contained"
            onPress={showModal}
          >
            Xuất điểm
          </Button>
        </View>
      </View>
      <Portal>
        <Dialog visible={lockDialogVisible} onDismiss={hideLockDialog}>
          <Dialog.Title>
            {isLocking
              ? "Xác Nhận Mở Khóa Bảng Điểm: "
              : "Xác Nhận Khóa Bảng Điểm: "}
          </Dialog.Title>
          <Dialog.Content>
            <Text>
              Bạn có chắc chắn muốn {isLocking ? "mở khóa" : "khóa"} bảng điểm
              không?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideLockDialog}>Hủy</Button>
            <Button
              onPress={async () => {
                hideLockDialog(); // Hide the dialog first
                await lockScoreOfStudyClassRoom(); // Then call the lock/unlock function
              }}
            >
              Đồng ý
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Provider>
  );
};

export default ListStudentScores;
