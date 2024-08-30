import React, { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
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
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "react-native-vector-icons/AntDesign";

const RegisterStudy = ({ navigation, route }) => {
  const token = route.params?.token;
  const user = route.params?.user;

  const [loading, setLoading] = useState(false);
  const [studyClassRooms, setStudyClassRooms] = useState([]);
  const [page, setPage] = useState(1);
  const [kw, setKw] = useState("");
  const [semester, setSemester] = useState("");
  const [data, setData] = useState([]);
  const [value, setValue] = useState(null);

  const loadSemester = async () => {
    try {
      const url = `${endpoints["list-semester"]}`;
      const res = await authApi(token).get(url);
      const arr = res.data.results.map((item) => ({
        label: item.name,
        value: item.name,
      }));
      arr.push({
        label: "Show All",
        value: "Show All",
      });
      setData(arr);
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

  const renderItem = (item) => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{item.label}</Text>
        {item.value === value && (
          <AntDesign
            style={styles.icon}
            color="black"
            name="Safety"
            size={20}
          />
        )}
      </View>
    );
  };

  const loadStudyClassRooms = async () => {
    if (page <= 0) return;

    try {
      setLoading(true);
      let url = `${endpoints["list-studyclassrooms-for-register"](
        user.id
      )}?page=${page}`;
      if (kw) url += `&kw=${kw}`;
      if (semester) url += `&semester=${semester}`;

      const res = await authApi(token).get(url);
      setStudyClassRooms((prev) =>
        page === 1 ? res.data.results : [...prev, ...res.data.results]
      );
      if (!res.data.next) setPage(0); // No more pages to load
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

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 100; // Increase padding if needed
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  const loadMore = ({ nativeEvent }) => {
    if (!loading && isCloseToBottom(nativeEvent) && page > 0) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    loadStudyClassRooms();
  }, [page, kw, semester]);

  useEffect(() => {
    loadSemester();
  }, []);

  const handleSearchChange = (value) => {
    setPage(1);
    setKw(value);
  };

  const handleItemChange = (item) => {
    setPage(1);
    setSemester(item.value);
  };

  const registerStudy = async (studyclassroom_id) => {
    try {
      setLoading(true);
      const url = `${endpoints["register-study"](studyclassroom_id)}`;
      const res = await authApi(token).post(url, {
        student_id: user.id,
      });
      Alert.alert(res.data.message);
      setPage(1); // Reset page after registration
    } catch (error) {
      if (error.response && error.response.status === 400) {
        Alert.alert("Error", error.response.data.message);
      } else {
        console.log("Unexpected error: ", error);
        Alert.alert("Error", "Failed to register study.");
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

        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={data}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={"Chọn học kỳ..."}
          searchPlaceholder="Search..."
          value={value}
          onChange={(item) => {
            handleItemChange(item);
          }}
          renderLeftIcon={() => (
            <AntDesign
              style={styles.icon}
              color="black"
              name="Safety"
              size={20}
            />
          )}
          renderItem={renderItem}
        />
        {studyClassRooms.length > 0 ? (
          <ScrollView
            onScroll={loadMore}
            scrollEventThrottle={400}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={() => {
                  setPage(1);
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

const styles = StyleSheet.create({
  dropdown: {
    margin: 16,
    height: 50,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  icon: {
    marginRight: 5,
  },
  item: {
    padding: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textItem: {
    flex: 1,
    fontSize: 16,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
