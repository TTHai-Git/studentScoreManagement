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
import { Button, Searchbar } from "react-native-paper";

const ListStudentScores = ({ navigation, route }) => {
  const token = route.params?.token;
  const studyclassroom_id = route.params?.studyclassroom_id;

  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState([]);
  const [kw, setKw] = useState("");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

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
      let res = await authApi(token).patch(url);
      console.log(res.data.message);
      Alert.alert(res.data.message);
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
    <View style={[MyStyle.container, MyStyle.centerContainer]}>
      <Searchbar
        onChangeText={search}
        value={kw}
        placeholder="Tìm theo từ khóa ..."
      />

      <ScrollView
        onScroll={loadMore}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && page === 1 && <ActivityIndicator />}
        {scores.map((c) => (
          <TouchableOpacity key={`${c.study.student_id}-${c.scorecolumn_id}`}>
            <Text>Id student: {c.study.student_id}</Text>
            <Text>MSSV: {c.study.student_code}</Text>
            <Text>Họ Và Tên: {c.study.student_name}</Text>
            <Text>Email: {c.study.student_email}</Text>
            <Text>Id Cột Điểm: {c.scorecolumn_id}</Text>
            <Text>Loại Cột Điểm: {c.scorecolumn_type}</Text>
            <Text>Trọng số: {c.scorecolumn_percent}</Text>
            <Text>Điểm: {c.score}</Text>
          </TouchableOpacity>
        ))}
        {loading && page > 1 && <ActivityIndicator />}
      </ScrollView>
      <Button onPress={lockScoreOfStudyClassRoom}>Khóa điểm</Button>
      <Button>Lưu nháp</Button>
      <Button onPress={exportScoresCSV}>Xuất file điểm CSV</Button>
      <Button onPress={exportScoresPDF}>Xuất file điểm PDF</Button>
    </View>
  );
};

export default ListStudentScores;
