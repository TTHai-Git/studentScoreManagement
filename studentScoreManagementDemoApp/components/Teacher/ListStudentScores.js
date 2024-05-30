import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { authApi, endpoints } from "../../configs/APIs";
import MyStyle from "../../styles/MyStyle";
import { Button, Modal, Portal, Provider, Searchbar } from "react-native-paper";
import { Table, TableWrapper, Row, Rows, Col } from "react-native-table-component";
import Styles from "../Teacher/Styles";

const ListStudentScores = ({ navigation, route }) => {
  const token = route.params?.token;
  const studyclassroom_id = route.params?.studyclassroom_id;

  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState([]);
  const [kw, setKw] = useState("");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [visible, setVisible] = useState(false);

  let showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const tableHead = ["MSSV", "Họ và tên", "Email", "Điểm GK", "Điểm CK"];
  const widthArr = [60, 200, 300, 100, 100];

  const groupedScores = scores.reduce((student, curr) => {
    const studentId = curr.study.student_id;
    const existingStudent = student.find(c => c.student_id === studentId);

    if (existingStudent) {
      if (curr.scorecolumn_type === "Điểm GK") {
        existingStudent.score_mid = curr.score;
      } else if (curr.scorecolumn_type === "Điểm CK") {
        existingStudent.score_end = curr.score;
      }
    } else {
      student.push({
        student_id: studentId,
        student_code: curr.study.student_code,
        student_name: curr.study.student_name,
        student_email: curr.study.student_email,
        score_mid: curr.scorecolumn_type === "Điểm GK" ? curr.score : "",
        score_end: curr.scorecolumn_type === "Điểm CK" ? curr.score : "",
      });
    }

    return student;
  }, []);

  const loadScoresOfStudyClassRoom = async () => {
    if (page > 0) {
      try {
        setLoading(true);
        let url = `${endpoints["scores"](studyclassroom_id)}?page=${page}`;
        if (kw) {
          url = `${endpoints["scores"](
            studyclassroom_id
          )}?kw=${kw}&page=${page}`;
        }
        let res = await authApi(token).get(url);
        console.log(res.data.results);
        if (page === 1) {
          setScores(res.data.results);
        } else if (page > 1) {
          setScores((current) => [...current, ...res.data.results]);
        }
        if (res.data.next === null) setPage(0);
      } catch (ex) {
        console.error(ex);
      } finally {
        setLoading(false);
      }
    }
  };

  const addScores = async (student_id, scorecolumn_id, score) => {
    try {
      let url = `${endpoints["add-scores"](studyclassroom_id)}`;
      let res = await authApi(token).post(url, {
        student_id: student_id,
        scorecolumn_id: scorecolumn_id,
        score: score,
      });
      console.log(res.data.message);
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
      setTimeout(async () => {
        let res = await authApi(token).patch(url);
        console.log(res.data.message);
        Alert.alert(res.data.message);
      }, 2000);
    } catch (ex) {
      console.error(ex);
    }
  };

  const exportScoresCSV = async () => {
    try {
      let url = `${endpoints["export-csv-scores"](studyclassroom_id)}`;
      let res = await authApi(token).get(url);
      console.log(res.data.message);
      Alert.alert(res.data.message);
    } catch (ex) {
      console.error(ex);
    }
  };

  const exportScoresPDF = async () => {
    try {
      let url = `${endpoints["export-pdf-scores"](studyclassroom_id)}`;
      let res = await authApi(token).get(url);
      console.log(res.data.message);
      Alert.alert(res.data.message);
    } catch (ex) {
      console.error(ex);
    }
  };

  useEffect(() => {
    loadScoresOfStudyClassRoom();
  }, [kw, page]);

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

  const search = (value) => {
    setPage(1);
    setKw(value);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadScoresOfStudyClassRoom();
    setRefreshing(false);
  };

  return (
    <Provider>
      <View style={[MyStyle.container, MyStyle.centerContainer]}>

        <Searchbar
          onChangeText={search}
          value={kw}
          placeholder="Tìm theo từ khóa"
        />

        <ScrollView
          onScroll={loadMore}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {loading && page === 1 && <ActivityIndicator />}

          <ScrollView horizontal={true}>
              <View style={MyStyle.table}>
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
                        data={[c.student_code, c.student_name, c.student_email, c.score_mid, c.score_end]}
                        style={MyStyle.body}
                        textStyle={MyStyle.text}
                        widthArr={widthArr}
                      />
                    ))
                  ) : (
                    <Row
                      data={['', '', '', '', '']}
                      style={MyStyle.body}
                      textStyle={MyStyle.text}
                      widthArr={widthArr}
                    />
                  )}
                </Table>
              </View>
          </ScrollView>

          {loading && page > 1 && <ActivityIndicator />}
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
                  {" "}
                    Xuất file điểm PDF{" "}
                  </Button>
                  <Button
                    style={MyStyle.button_user}
                    mode="contained"
                    onPress={exportScoresCSV}
                  >
                  {" "}
                    Xuất file điểm CSV{" "}
                  </Button>
            </View>
            </Modal>
          </Portal>

        <View style={Styles.button_score}>
          <Button style={MyStyle.button_user} mode="contained" onPress={lockScoreOfStudyClassRoom}> Khóa điểm </Button>
          <Button style={MyStyle.button_user} mode="contained" onPress={() => {console.log("Lưu nháp")}}> Lưu nháp </Button>
          <Button style={MyStyle.button_user} mode="contained" onPress={showModal}> Xuất điểm </Button>
        </View>

      </View>
    </Provider>
  );
};

export default ListStudentScores;
