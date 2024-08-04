import React, { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { authApi, endpoints } from "../../configs/APIs";
import {
  ActivityIndicator,
  Button,
  Provider,
  Searchbar,
} from "react-native-paper";
import MyStyle from "../../styles/MyStyle";
import Styles from "../General/Styles";

const RegisterStudy = ({ navigation, route }) => {
  let token = route.params?.token;
  let user = route.params?.user;

  const [loading, setLoading] = useState(false);
  const [studyClassRooms, setStudyClassRooms] = useState([]);
  const [page, setPage] = useState(1);
  const [kw, setKw] = useState("");
  const [error, setError] = useState(false);

  const loadStudyClassRooms = async () => {
    if (page > 0) {
      try {
        setLoading(true);
        let url = `${endpoints["list-studyclassrooms-for-register"](
          user.id
        )}?page=${page}`;
        if (kw) {
          url += `&kw=${kw}`;
        }
        let res = await authApi(token).get(url);
        console.log(res.data);
        if (page === 1) {
          setStudyClassRooms(res.data.results);
        } else {
          setStudyClassRooms((current) => [...current, ...res.data.results]);
        }
        if (res.data.next === null) {
          setPage(0); // No more pages to load
        }
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
    if (!loading && isCloseToBottom(nativeEvent)) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    loadStudyClassRooms();
  }, [page, kw]);

  const handleSearchChange = (value) => {
    setPage(1); // Reset page to 1 when new search is performed
    setKw(value);
  };

  const registerStudy = async (studyclassroom_id) => {
    try {
      setLoading(true);
      let url = `${endpoints["register-study"](studyclassroom_id)}`;
      let res = await authApi(token).post(url, {
        student_id: user.id,
      });
      Alert.alert(res.data.message);
      navigation.navigate("RegisterStudy", {
        user: user,
        token: token,
      });
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        // Handle the 400 error
        Alert.alert("Error", ex.response.data.message);
      } else {
        // Handle other errors
        console.log("Unexpected error: ", ex);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Provider>
      <View style={MyStyle.container}>
        <Searchbar
          onChangeText={handleSearchChange}
          value={kw}
          placeholder="Tìm theo kiếm môn học"
        />
        {studyClassRooms.length > 0 ? (
          <ScrollView
            onScroll={loadMore}
            scrollEventThrottle={400}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={() => {
                  setPage(1); // Reset page to 1 and reload
                  loadStudyClassRooms();
                }}
              />
            }
          >
            {studyClassRooms.map((c) => (
              <TouchableOpacity key={c.id}>
                <View style={Styles.class}>
                  <Text style={Styles.text_class}>Lớp: {c.name}</Text>
                  <Text style={Styles.text_class}>Môn: {c.subject_name}</Text>
                  <Text style={Styles.text_class}>Nhóm: {c.group_name}</Text>
                  <Text style={Styles.text_class}>
                    Học kỳ: {c.semester_name}
                  </Text>
                  <Text style={Styles.text_class}>
                    Năm Học: {c.semester_year}
                  </Text>
                  <Text style={Styles.text_class}>
                    Giảng viên: {c.teacher_name}
                  </Text>
                  <Text style={Styles.text_class}>
                    Ngày Bắt Đầu: {c.started_date}
                  </Text>
                  <Text style={Styles.text_class}>
                    Ngày Kết Thúc: {c.ended_date}
                  </Text>
                  <Button
                    style={MyStyle.button_user}
                    mode="contained"
                    onPress={() => registerStudy(c.id)}
                  >
                    Đăng Ký
                  </Button>
                </View>
              </TouchableOpacity>
            ))}
            {loading && page > 1 && <ActivityIndicator />}
          </ScrollView>
        ) : (
          <Text>Không tìm thấy lớp học nào đang mở để đăng ký!!!</Text>
        )}
      </View>
    </Provider>
  );
};

export default RegisterStudy;
