import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { Agenda } from "react-native-calendars";
import { authApi, endpoints } from "../../configs/APIs";

const ScheduleStudyClassrooms = ({ navigation, route }) => {
  let user = route.params?.user;
  let token = route.params?.token;
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(false);

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const url = `${endpoints["get-schedule"]}`;
      const res = await authApi(token).get(url);
      const formattedData = formatScheduleData(res.data.data);
      setSchedule(formattedData);
    } catch (ex) {
      console.log(ex.response);
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
        teacher_name: item.teacher_name,
        started_time: item.started_time.split("T")[1].split("Z")[0],
        ended_time: item.ended_time.split("T")[1].split("Z")[0],
        descriptions: item.descriptions,
      });
    });
    return formattedData;
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const deleteSchedule = async (item) => {
    try {
      const url = `${endpoints["del-schedule"](item.id)}`;
      const res = await authApi(token).delete(url);

      if (res.status === 204) {
        Alert.alert("Xoá lịch học thành công");
        navigation.navigate("ScheduleStudyClassrooms", {
          user: user,
          token: token,
        });
      }
    } catch (ex) {
      console.log(ex.response);
    }
  };

  const renderItem = (item, isFirst) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.item, isFirst ? styles.firstItem : null]}
        onPress={() => console.log(item)}
      >
        <Text style={styles.itemText}>{item.subject_name}</Text>
        <Text style={styles.itemText}>
          Classroom: {item.studyclassroom_name}
        </Text>
        <Text style={styles.itemText}>Teacher: {item.teacher_name}</Text>
        <Text style={styles.itemText}>Start: {item.started_time}</Text>
        <Text style={styles.itemText}>End: {item.ended_time}</Text>
        <Text style={styles.itemText}>Descriptions: {item.descriptions}</Text>
        {user.role === "teacher" && (
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                navigation.navigate("UpdateSchedule", {
                  user: user,
                  token: token,
                  item_id: item.id,
                })
              }
            >
              <Text style={styles.buttonText}>Sửa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => deleteSchedule(item)}
            >
              <Text style={styles.buttonText}>Xoá</Text>
            </TouchableOpacity>
          </>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Agenda items={schedule} renderItem={renderItem} />
    </SafeAreaView>
  );
};

export default ScheduleStudyClassrooms;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    backgroundColor: "#e3f2fd",
    padding: 10,
    marginRight: 10,
    marginTop: 17,
    borderRadius: 5,
  },
  itemText: {
    color: "#000",
    fontSize: 16,
    marginBottom: 5,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 8,
    borderRadius: 5,
    marginTop: 5,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
  },
});
