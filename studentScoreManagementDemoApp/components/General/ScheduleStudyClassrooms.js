import React, { useContext, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Agenda, LocaleConfig } from "react-native-calendars";
import Icon from "react-native-vector-icons/FontAwesome";
import { authApi, endpoints } from "../../configs/APIs";
import { MyUserContext } from "../../configs/Contexts";

LocaleConfig.locales["vi"] = {
  monthNames: [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ],
  monthNamesShort: [
    "Th.1",
    "Th.2",
    "Th.3",
    "Th.4",
    "Th.5",
    "Th.6",
    "Th.7",
    "Th.8",
    "Th.9",
    "Th.10",
    "Th.11",
    "Th.12",
  ],
  dayNames: [
    "Chủ Nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
  ],
  dayNamesShort: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
  today: "Hôm nay",
};

// Set the default locale to Vietnamese
LocaleConfig.defaultLocale = "vi";

const ScheduleStudyClassrooms = ({ navigation, route }) => {
  const user = useContext(MyUserContext);

  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [markedDates, setMarkedDates] = useState({});

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const url = endpoints["get-schedule"];
      const res = await authApi(user.access_token).get(url);
      const formattedData = formatScheduleData(res.data.results);
      if (res.data.results.length === 0) {
        Alert.alert(
          "Thông Báo: ",
          "Chưa có lịch học tập của các lớp học cho sinh viên và giảng viên"
        );
      } else {
        setSchedule(formattedData);
        setMarkedDates(generateMarkedDates(formattedData));
      }
    } catch (error) {
      console.error(error.response);
      if (error.response && error.response.data) {
        Alert.alert("Error", error.response.data.message);
      } else {
        Alert.alert("Error", "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatScheduleData = (data) => {
    const formattedData = {};
    data.forEach((item) => {
      const date = item.started_time.split("T")[0];
      if (!formattedData[date]) {
        formattedData[date] = [];
      }
      formattedData[date].push({
        id: item.id,
        subject_code: item.subject_code,
        subject_name: item.subject_name,
        studyclassroom_name: item.studyclassroom_name,
        studyclassroom_group: item.studyclassroom_group,
        teacher_name: item.teacher_name,
        started_time: item.started_time.split("T")[1].split("Z")[0],
        ended_time: item.ended_time.split("T")[1].split("Z")[0],
        descriptions: item.descriptions,
      });
    });
    return formattedData;
  };

  const generateMarkedDates = (data) => {
    const marked = {};
    Object.keys(data).forEach((date) => {
      let dotColor = "#007bff"; // Default blue color

      // Check if any description contains "Thi" for this date
      const containsThi = data[date].some(
        (item) => item.descriptions && item.descriptions.includes("Thi", "hop")
      );
      if (containsThi) {
        dotColor = "#ff0000"; // Red color if "Thi" is found
      }

      marked[date] = { marked: true, dotColor };
    });
    return marked;
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const deleteSchedule = async (item_id) => {
    try {
      const url = `${endpoints["del-schedule"](item_id)}`;
      const res = await authApi(user.access_token).delete(url);
      Alert.alert("Success", res.data.message);
      loadSchedule();
    } catch (ex) {
      console.log(ex.response);
    }
  };

  const renderItem = (item, isFirst) => {
    return item ? (
      <>
        <View
          key={item.id}
          style={[styles.item, isFirst ? styles.firstItem : null]}
        >
          <Text style={styles.itemTitle}>
            {" "}
            {item.subject_code} - {item.subject_name}
          </Text>
          <Text style={styles.itemText}>
            <Icon name="building" size={16} color="#007bff" /> Tên Lớp Học:{" "}
            {item.studyclassroom_name}
          </Text>
          <Text style={styles.itemText}>
            <Icon name="group" size={16} color="#007bff" /> Nhóm:{" "}
            {item.studyclassroom_group}
          </Text>
          <Text style={styles.itemText}>
            <Icon name="user" size={16} color="#007bff" /> Giảng Viên:{" "}
            {item.teacher_name}
          </Text>
          <Text style={styles.itemText}>
            <Icon name="clock-o" size={16} color="#007bff" /> Thời gian bắt đầu:{" "}
            {item.started_time}
          </Text>
          <Text style={styles.itemText}>
            <Icon name="clock-o" size={16} color="#007bff" /> Thời gian kết
            thúc: {item.ended_time}
          </Text>
          <Text style={styles.itemText}>
            <Icon name="info-circle" size={16} color="#007bff" /> Mô Tả:{" "}
            {item.descriptions}
          </Text>
          {user.role === "teacher" && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button_up}
                onPress={() =>
                  navigation.navigate("UpdateSchedule", {
                    item_id: item.id,
                  })
                }
              >
                <Icon name="edit" size={16} color="#fff" />
                <Text style={styles.buttonText_up}>Sửa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button_del}
                onPress={() =>
                  Alert.alert(
                    "Xác Nhận Xoá",
                    "Bạn có muốn xoá lịch học này hay không?",
                    [
                      {
                        text: "Đồng Ý",
                        onPress: () => deleteSchedule(item.id),
                        style: "destructive",
                      },
                      {
                        text: "Huỷ",
                        style: "cancel",
                      },
                    ]
                  )
                }
              >
                <Icon name="trash" size={16} color="#fff" />
                <Text style={styles.buttonText_del}>Xoá</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </>
    ) : (
      <></>
    );
  };

  const onDayPress = (day) => {
    const selectedDate = day.dateString;
    setSelectedDate(selectedDate);

    const hasDot = markedDates[selectedDate]?.marked;
    const formattedDate = new Date(selectedDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Check if the date already has a schedule
    if (hasDot && user.role === "teacher") {
      // Show a dialog with two options
      Alert.alert(
        "Chọn Hành Động:",
        `Bạn đã có lịch vào ngày ${formattedDate}. Bạn có muốn Thêm lịch học hay không?`,
        [
          {
            text: "Thêm lịch học",
            onPress: () => {
              // Logic to add a new schedule for the selected date
              navigation.navigate("NewSchedule", {
                startedDate: formattedDate,
                endedDate: formattedDate,
              });
            },
          },
          {
            text: "Xem lịch học",
            style: "cancel",
          },
        ]
      );
    } else {
      // If there's no existing schedule, just go to "NewSchedule"
      if (user.role === "teacher") {
        navigation.navigate("NewSchedule", {
          startedDate: formattedDate,
          endedDate: formattedDate,
        });
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <Agenda
          items={schedule}
          renderItem={renderItem}
          onDayPress={onDayPress}
          markedDates={markedDates}
        />
      )}
    </SafeAreaView>
  );
};

export default ScheduleStudyClassrooms;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  item: {
    backgroundColor: "#fff",
    padding: 15,
    marginRight: 10,
    marginTop: 17,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 5,
  },
  itemText: {
    color: "#333",
    fontSize: 14,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  button_up: {
    backgroundColor: "#00bfff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  buttonText_up: {
    color: "#fff",
    textAlign: "center",
    marginLeft: 5,
  },
  button_del: {
    backgroundColor: "#ff0000",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText_del: {
    color: "#fff",
    textAlign: "center",
    marginLeft: 5,
  },
});
