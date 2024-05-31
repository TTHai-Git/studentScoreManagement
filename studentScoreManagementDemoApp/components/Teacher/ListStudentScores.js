import { useEffect, useState, useCallback } from "react";
import { Alert, ScrollView, View, ActivityIndicator } from "react-native";
import { authApi, endpoints } from "../../configs/APIs";
import MyStyle from "../../styles/MyStyle";
import { Button, Modal, Portal, Provider, Searchbar } from "react-native-paper";
import { Table, Row } from "react-native-table-component";
import Styles from "../Teacher/Styles";

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

  const loadScoreColumns = useCallback(async () => {
    try {
      let url = `${endpoints["get-score-columns"](studyclassroom_id)}`;
      let res = await authApi(token).get(url);
      setScoreColumns(res.data);
    } catch (ex) {
      console.error(ex);
    }
  }, [studyclassroom_id, token]);

  useEffect(() => {
    loadScoreColumns();
  }, [loadScoreColumns]);

  const loadScoresOfStudyClassRoom = useCallback(async () => {
    try {
      setLoading(true);
      let url = `${endpoints["scores"](studyclassroom_id)}`;
      if (kw) {
        url += `?kw=${kw}`;
      }
      let res = await authApi(token).get(url);
      setScores(res.data.scoredetails_with_scores);
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

  const addScores = async (student_id, scorecolumn_id, score) => {
    try {
      let url = `${endpoints["add-scores"](studyclassroom_id)}`;
      let res = await authApi(token).post(url, {
        student_id: student_id,
        scorecolumn_id: scorecolumn_id,
        score: score,
      });
      Alert.alert(res.data.message);
    } catch (ex) {
      console.error(ex);
    }
  };

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
    "MSSV",
    "Họ và tên",
    ...scoreColumns.map((col) => `Điểm ${col.type}`),
  ];
  const widthArr = [99, 99, ...scoreColumns.map(() => 99)];

  const groupedScores = scores.reduce((student, curr) => {
    const studentId = curr.study.student_id;
    const existingStudent = student.find((c) => c.student_id === studentId);

    if (existingStudent) {
      existingStudent[`score_${curr.scorecolumn_id}`] = curr.score;
    } else {
      const newStudent = {
        student_id: studentId,
        student_code: curr.study.student_code,
        student_name: curr.study.student_name,
      };
      scoreColumns.forEach((col) => {
        newStudent[`score_${col.id}`] =
          col.id === curr.scorecolumn_id ? curr.score : "";
      });
      student.push(newStudent);
    }

    return student;
  }, []);

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
                {groupedScores.length > 0 ? (
                  groupedScores.map((c, index) => (
                    <Row
                      key={index}
                      data={[
                        c.student_code,
                        c.student_name,
                        ...scoreColumns.map((col) => c[`score_${col.id}`]),
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
            onPress={() => {
              console.log("Lưu nháp");
            }}
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
