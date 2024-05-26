import { useEffect, useState } from "react";
import { authApi, endpoints } from "../../configs/APIs";
import {
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import MyStyle from "../../styles/MyStyle";
import { Avatar, Searchbar } from "react-native-paper";

const ListStudents = ({ navigation, route }) => {
  const studyclassroom_id = route.params?.studyclassroom_id;
  const token = route.params?.token;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [kw, setKw] = useState("");
  const [page, setPage] = useState(1);

  const loadStudents = async (reset = false) => {
    if (reset) {
      setPage(1);
    }
    if (page > 0) {
      try {
        setLoading(true);
        let url = `${endpoints["students"](studyclassroom_id)}?page=${page}`;
        if (kw) {
          url = `${endpoints["students"](
            studyclassroom_id
          )}?kw=${kw}&page=${page}`;
        }

        let res = await authApi(token).get(url);
        if (page === 1) {
          setStudents(res.data.results);
        } else {
          setStudents((current) => [...current, ...res.data.results]);
        }
        if (res.data.next === null) setPage(0);
      } catch (ex) {
        console.error(ex);
      } finally {
        setLoading(false);
        setRefreshing(false);
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
    if (!loading && isCloseToBottom(nativeEvent)) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStudents(true);
  };

  const search = (value) => {
    setPage(1);
    setKw(value);
  };

  useEffect(() => {
    loadStudents();
  }, [kw, page]);

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
        {students.map((c) => (
          <TouchableOpacity key={c.id}>
            <Avatar.Image size={50} source={{ uri: c.student_avatar }} />
            <Text>{c.student_code}</Text>
            <Text>{c.student_name}</Text>
            <Text>{c.student_email}</Text>
          </TouchableOpacity>
        ))}
        {loading && page > 1 && <ActivityIndicator />}
      </ScrollView>
    </View>
  );
};

export default ListStudents;
