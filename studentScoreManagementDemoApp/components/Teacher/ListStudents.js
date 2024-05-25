import { useEffect, useState } from "react";
import { authApi, endpoints } from "../../configs/APIs";
import {
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from "react-native";
import MyStyle from "../../styles/MyStyle";
import { Searchbar } from "react-native-paper";

const ListStudents = ({ navigation, route }) => {
  const studyclassroom_id = route.params?.studyclassroom_id;
  const token = route.params?.token;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [kw, setKw] = useState("");
  const [page, setPage] = useState(1);

  const loadStudents = async () => {
    if (page > 0) {
      // console.log(token);
      // console.log(studyclassroom_id);
      try {
        setLoading(true);
        let url = `${endpoints["students"](studyclassroom_id)}?page=${page}`;
        if (kw) {
          url = `${endpoints["students"](
            studyclassroom_id
          )}?kw=${kw}&page=${page}`;
        }

        let res = await authApi(token).get(url);
        if (page === 1) setStudents(res.data.results);
        else if (page > 1)
          setStudents((current) => {
            return [...current, ...res.data.results];
          });
        if (res.data.next === null) setPage(0);
      } catch (ex) {
        console.error(ex);
      } finally {
        setLoading(false);
      }
    }
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
    if (loading === false && isCloseToBottom(nativeEvent)) {
      setPage(page + 1);
    }
  };

  const search = (value, callback) => {
    setPage(1);
    callback(value);
  };
  useEffect(() => {
    loadStudents();
  }, [kw, page]);
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
        {students.map((c) => {
          return (
            <TouchableOpacity key={c.id}>
              <Text>{c.student_code}</Text>
              <Text>{c.student_name}</Text>
              <Text>{c.student_email}</Text>
            </TouchableOpacity>
          );
        })}
        {loading && page > 1 && <ActivityIndicator />}
      </ScrollView>
      <Pressable
        onPress={() => {
          navigation.navigate("ListStudentScores", {
            token: token,
            studyclassroom_id: studyclassroom_id,
          });
        }}
      >
        <Text>Sang Bang Diem</Text>
      </Pressable>
    </View>
  );
};

export default ListStudents;
