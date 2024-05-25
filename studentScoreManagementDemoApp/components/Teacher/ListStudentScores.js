import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { authApi, endpoints } from "../../configs/APIs";
import MyStyle from "../../styles/MyStyle";
import { Button, Searchbar } from "react-native-paper";

const ListStudentScores = ({ navigaiton, route }) => {
  const token = route.params?.token;
  const studyclassroom_id = route.params?.studyclassroom_id;

  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState([]);
  const [kw, setKw] = useState("");

  const [page, setPage] = useState(1);

  const loadScoresOfStudyClassRoom = async () => {
    if (page > 0) {
      try {
        setLoading(true);
        let url = `${endpoints["scores"](studyclassroom_id)}?page=${page}`;
        if (kw) {
          url = `${endpoints["students"](
            studyclassroom_id
          )}?kw=${kw}&page=${page}`;
        }
        let res = await authApi(token).get(url);
        console.log(res.data.results);
        if (page === 1) setScores(res.data.results);
        else if (page > 1)
          setScores((current) => {
            return [...current, ...res.data.results];
          });
        setScores(res.data.results);
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
      console.log(res.message);
    } catch (ex) {
      console.error(ex);
    } finally {
      console.log(res.message);
    }
  };

  const lockScoreOfStudyClassRoom = async () => {
    try {
      let url = `${endpoints["locked-score-of-studyclassroom"](
        studyclassroom_id
      )}`;
      let res = await authApi(token).patch(url);
    } catch (ex) {
      console.error(ex);
    } finally {
      console.log(res.message);
    }
  };

  const exportScoresCSV = async () => {
    try {
      let url = `${endpoints["export-csv-scores"](studyclassroom_id)}`;
      let res = await authApi(token).patch(url);
      console.log(res.message);
    } catch (ex) {
      console.error(ex);
    } finally {
      console.log(res.message);
    }
  };

  const exportScoresPDF = async () => {
    try {
      let url = `${endpoints["export-pdf-scores"](studyclassroom_id)}`;
      let res = await authApi(token).patch(url);
      console.log(res.message);
    } catch (ex) {
      console.error(ex);
    } finally {
      console.log(res.message);
    }
  };

  useEffect(() => {
    loadScoresOfStudyClassRoom();
  }, []);

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
    if (loading === false && isCloseToBottom(nativeEvent)) {
      setPage(page + 1);
    }
  };

  const search = (value, callback) => {
    setPage(1);
    callback(value);
  };

  return (
    <View style={[MyStyle.container, MyStyle.centerContainer]}>
      <ScrollView onScroll={loadMore}>
        <Searchbar
          onChangeText={(t) => search(t, setKw)}
          value={kw}
          placeholder="Tìm theo từ khóa ..."
        ></Searchbar>

        <RefreshControl onRefresh={() => loadStudents} />
        {loading && <ActivityIndicator />}
        {scores.map((c) => {
          return (
            <TouchableOpacity key={c.id}>
              <Text>Id student: {c.study.student_id}</Text>
              <Text>MSSV: {c.study.student_code}</Text>
              <Text>Họ Và Tên: {c.study.student_name}</Text>
              <Text>Email: {c.study.student_email}</Text>
              <Text>Id Cột Điểm: {c.scorecolumn_id}</Text>
              <Text>Loại Cột Điểm: {c.scorecolumn_type}</Text>
              <Text>Trọng số: {c.scorecolumn_percent}</Text>
              <Text>Điểm: {c.score}</Text>
            </TouchableOpacity>
          );
        })}
        {loading && page > 1 && <ActivityIndicator />}
      </ScrollView>
        <Button onPress={lockScoreOfStudyClassRoom}>Khóa điểm</Button>
        <Button>Lưu nháp</Button>
        <Button onPress={exportScoresCSV}>Xuất file điểm CSV</Button>
        <Button onPress={exportScoresPDF}>Xuất file điểm PDF</Button>
      <Pressable
        onPress={() => {
          navigation.navigate("Topics", {
            token: token,
            studyclassroom_id: studyclassroom_id,
          });
        }}
      >
        <Text>Sang diễn đàn môn học</Text>
      </Pressable>
    </View>
  );
};
export default ListStudentScores;
