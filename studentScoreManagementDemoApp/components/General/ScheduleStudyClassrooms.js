import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Agenda } from "react-native-calendars";
import Icon from "react-native-vector-icons/FontAwesome";
import { authApi, endpoints } from "../../configs/APIs";

const ScheduleStudyClassrooms = ({ navigation, route }) => {
  const user = route.params?.user;
  const token = route.params?.token;
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [markedDates, setMarkedDates] = useState({});

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const url = endpoints["get-schedule"];
      const res = await authApi(token).get(url);
      const formattedData = formatScheduleData(res.data.data);
      setSchedule(formattedData);
      setMarkedDates(generateMarkedDates(formattedData));
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
      marked[date] = { marked: true, dotColor: "#007bff" };
    });
    return marked;
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const deleteSchedule = async (item_id) => {
    try {
      const url = `${endpoints["del-schedule"](item_id)}`;
      const res = await authApi(token).delete(url);
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
          <Text style={styles.itemTitle}>{item.subject_name}</Text>
          <Text style={styles.itemText}>
            <Icon name="building" size={16} color="#007bff" /> Classroom:{" "}
            {item.studyclassroom_name}
          </Text>
          <Text style={styles.itemText}>
            <Icon name="group" size={16} color="#007bff" /> Group:{" "}
            {item.studyclassroom_group}
          </Text>
          <Text style={styles.itemText}>
            <Icon name="user" size={16} color="#007bff" /> Teacher:{" "}
            {item.teacher_name}
          </Text>
          <Text style={styles.itemText}>
            <Icon name="clock-o" size={16} color="#007bff" /> Start:{" "}
            {item.started_time}
          </Text>
          <Text style={styles.itemText}>
            <Icon name="clock-o" size={16} color="#007bff" /> End:{" "}
            {item.ended_time}
          </Text>
          <Text style={styles.itemText}>
            <Icon name="info-circle" size={16} color="#007bff" /> Descriptions:{" "}
            {item.descriptions}
          </Text>
          {user.role === "teacher" && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button_up}
                onPress={() =>
                  navigation.navigate("UpdateSchedule", {
                    user: user,
                    token: token,
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
                    "Delete Confirmation",
                    "Bạn có muốn xoá lịch học này hay không?",
                    [
                      {
                        text: "Cancel",
                        style: "cancel",
                      },
                      {
                        text: "Delete",
                        onPress: () => deleteSchedule(item.id),
                        style: "destructive",
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
      <>
        <Text style={styles.itemText}>
          Bạn không có lịch học nào vào ngày hôm nay
        </Text>
      </>
    );
  };

  const onDayPress = (day) => {
    const selectedDate = day.dateString;
    setSelectedDate(selectedDate);

    const hasDot = markedDates[selectedDate]?.marked;

    if (!hasDot) {
      if (user.role === "teacher") {
        const formattedDate = new Date(selectedDate).toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }
        );

        navigation.navigate("NewSchedule", {
          user: user,
          token: token,
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
