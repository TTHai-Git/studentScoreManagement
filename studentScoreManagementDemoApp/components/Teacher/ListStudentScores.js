import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  ScrollView,
  View,
  ActivityIndicator,
  TextInput,
  StyleSheet,
} from "react-native";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import MyStyle from "../../styles/MyStyle";
import {
  Button,
  DataTable,
  Modal,
  Portal,
  Provider,
  Searchbar,
} from "react-native-paper";
import Styles from "../Teacher/Styles";
import { Row, Table } from "react-native-table-component";

const ListStudentScores = ({ navigation, route }) => {
  const token = route.params?.token;
  const studyclassroom_id = route.params?.studyclassroom_id;

  const [loading, setLoading] = useState(false);
  const [scoreColumns, setScoreColumns] = useState([]);
  const [scores, setScores] = useState([]);
  const [kw, setKw] = useState("");
  const [visible, setVisible] = useState(false);
  const [lockStatus, setLockStatus] = useState(false);
  const [isHandlingLockScore, setIsHandlingLockScore] = useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const loadScoresOfStudyClassRoom = useCallback(async () => {
    try {
      setLoading(true);
      let url = `${endpoints["scores"](studyclassroom_id)}`;
      if (kw) {
        url += `?kw=${kw}`;
      }
      let res = await authApi(token).get(url);
      setScores(res.data.scoredetails_with_scores.score_details);
      setScoreColumns(res.data.scoredetails_with_scores.score_cols);
    } catch (ex) {
      console.error(ex);
      Alert.alert("Error", "Failed to load scores. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [studyclassroom_id, token, kw]);

  useEffect(() => {
    loadScoresOfStudyClassRoom();
  }, [loadScoresOfStudyClassRoom]);

  const getLockedScoreStatus = useCallback(async () => {
    try {
      let url = `${endpoints["check-locked-scored-studyclassroom"](
        studyclassroom_id
      )}`;
      let res = await authApi(token).get(url);
      setLockStatus(res.data.is_lock);
    } catch (ex) {
      console.error(ex);
      Alert.alert("Error", "Failed to check lock status.");
    }
  }, [studyclassroom_id, token]);

  useEffect(() => {
    getLockedScoreStatus();
  }, [getLockedScoreStatus]);

  const lockScoreOfStudyClassRoom = async () => {
    try {
      let url = `${endpoints["locked-score-of-studyclassroom"](
        studyclassroom_id
      )}`;
      setIsHandlingLockScore(true);
      let res = await authApi(token).patch(url);
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
      let res = await authApi(token).get(url);
      Alert.alert("Success", res.data.message);
    } catch (ex) {
      console.error(ex);
      Alert.alert("Error", "Failed to export CSV.");
    }
  };

  const exportScoresPDF = async () => {
    try {
      let url = `${endpoints["export-pdf-scores"](studyclassroom_id)}`;
      let res = await authApi(token).get(url);
      Alert.alert("Success", res.data.message);
    } catch (ex) {
      console.error(ex);
      Alert.alert("Error", "Failed to export PDF.");
    }
  };

  const search = (value) => {
    setKw(value);
  };

  const tableHead = [
    "STT",
    "ID",
    "MSSV",
    "Họ và tên",
    ...scoreColumns.map((col) => `${col.type}`),
  ];
  const widthArr = [40, 40, 100, 200, ...scoreColumns.map(() => 120)];

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
      let res = await authApi(token).post(url, { scores: scores });
      console.log(res.data);
      Alert.alert("Success", res.data.message);
    } catch (ex) {
      console.log(ex);
      Alert.alert("Error", "Failed to save scores.");
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: "gray",
      padding: 15,
    },
    tableHeader: {
      backgroundColor: "#DCDCDC",
    },
    cell: {
      padding: 5,
    },
  });

  return (
    <Provider>
      <View style={[MyStyle.container, MyStyle.centerContainer]}>
        <Searchbar
          onChangeText={search}
          value={kw}
          placeholder="Tìm theo từ khóa"
        />
        <ScrollView horizontal={true}>
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
                        score.student_id,
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
                              onEndEditing={(e) =>
                                handleChangeScore(
                                  score.student_id,
                                  col.id,
                                  e.nativeEvent.text
                                )
                              }
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
                style={MyStyle.button_user}
                mode="contained"
                onPress={exportScoresPDF}
              >
                Xuất file điểm PDF
              </Button>
              <Button
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
            disabled={isHandlingLockScore}
            style={MyStyle.button_user}
            mode="contained"
            onPress={lockScoreOfStudyClassRoom}
          >
            {lockStatus ? "Mở khóa điểm" : "Khóa điểm"}
          </Button>
          <Button
            style={MyStyle.button_user}
            mode="contained"
            onPress={handleSaveScore}
          >
            Lưu nháp
          </Button>
          <Button
            style={MyStyle.button_user}
            mode="contained"
            onPress={showModal}
          >
            Xuất điểm
          </Button>
        </View>
      </View>
    </Provider>
  );
};

export default ListStudentScores;
