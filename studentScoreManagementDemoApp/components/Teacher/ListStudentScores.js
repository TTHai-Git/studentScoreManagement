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
  const [index, setIndex] = useState(1);

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
    }
  }, [studyclassroom_id, token]);

  useEffect(() => {
    getLockedScoreStatus();
  }, [getLockedScoreStatus]);

  // const addScores = async (student_id, scorecolumn_id, score) => {
  //   try {
  //     let url = `${endpoints["add-scores"](studyclassroom_id)}`;
  //     let res = await authApi(token).post(url, {
  //       student_id: student_id,
  //       scorecolumn_id: scorecolumn_id,
  //       score: score,
  //     });
  //     Alert.alert(res.data.message);
  //     loadScoresOfStudyClassRoom(); // Refresh scores after adding new score
  //   } catch (ex) {
  //     console.error(ex);
  //   }
  // };

  const lockScoreOfStudyClassRoom = async () => {
    try {
      let url = `${endpoints["locked-score-of-studyclassroom"](
        studyclassroom_id
      )}`;
      setIsHandlingLockScore(true);
      let res = await authApi(token).patch(url);
      Alert.alert(res.data.message);
      setLockStatus(!lockStatus);
    } catch (ex) {
      console.error(ex);
    } finally {
      setIsHandlingLockScore(false);
    }
  };

  const exportScoresCSV = async () => {
    try {
      let url = `${endpoints["export-csv-scores"](studyclassroom_id)}`;
      let res = await authApi(token).get(url);
      Alert.alert(res.data.message);
    } catch (ex) {
      console.error(ex);
    }
  };

  const exportScoresPDF = async () => {
    try {
      let url = `${endpoints["export-pdf-scores"](studyclassroom_id)}`;
      let res = await authApi(token).get(url);
      Alert.alert(res.data.message);
    } catch (ex) {
      console.error(ex);
    }
  };

  const search = (value) => {
    setKw(value);
  };

  const tableHead = [
    "ID",
    "STT",
    "MSSV",
    "Họ và tên",
    ...scoreColumns.map((col) => `${col.type}`),
  ];
  const widthArr = [30, 40, 100, 100, ...scoreColumns.map(() => 120)];

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
      Alert.alert(res.data.message);
    } catch (ex) {
      console.log(ex);
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
              // <DataTable style={styles.container}>
              //   <DataTable.Header style={styles.tableHeader}>
              //     <DataTable.Title>Id</DataTable.Title>
              //     <DataTable.Title>Tên</DataTable.Title>
              //     {scoreColumns.map((col) => (
              //       <DataTable.Title key={col.id}>{col.type}</DataTable.Title>
              //     ))}
              //   </DataTable.Header>

              //   {scores.length > 0 &&
              //     scores.map((score, index) => (
              //       <DataTable.Row key={index}>
              //         <DataTable.Cell>{score.student_id}</DataTable.Cell>
              //         <DataTable.Cell>{score.student_name}</DataTable.Cell>
              //         {scoreColumns.map((col) => {
              //           const scoreValue = score.scores.find(
              //             (s) => s.col_id === col.id
              //           )?.score;
              //           return (
              //             <DataTable.Cell key={col.id} style={styles.cell}>
              //               <TextInput
              //                 value={scoreValue ? scoreValue.toString() : ""}
              //                 style={{ fontSize: 20 }}
              //                 onChangeText={(value) =>
              //                   handleChangeScore(
              //                     score.student_id,
              //                     col.id,
              //                     value
              //                   )
              //                 }
              //                 keyboardType="numeric"
              //               />
              //             </DataTable.Cell>
              //           );
              //         })}
              //       </DataTable.Row>
              //     ))}
              // </DataTable>
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
                      key={index}
                      data={[
                        score.student_id,
                        (index = index + 1),
                        score.student_code,
                        score.student_name,
                        ...scoreColumns.map((col) => {
                          s = score.scores.filter((e) => e.col_id == col.id)[0]
                            .score;

                          return (
                            <TextInput
                              key={index}
                              value={s ? s.toString() : ""}
                              style={{ fontSize: 20, textAlign: "center" }}
                              onChangeText={(value) =>
                                handleChangeScore(
                                  score.student_id,
                                  col.id,
                                  value
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
                    data={["", "", ...scoreColumns.map(() => "")]}
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
