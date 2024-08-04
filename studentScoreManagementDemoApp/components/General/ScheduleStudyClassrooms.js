import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
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
      let url = `${endpoints["get-schedule"]}`;
      let res = await authApi(token).get(url);
      const formattedData = formatScheduleData(res.data.data);
      setSchedule(formattedData);
    } catch (ex) {
      console.log(ex.response);
    } finally {
      setLoading(false);
    }
  };

  const formatScheduleData = (data) => {
    let formattedData = {};
    data.forEach((item) => {
      const date = item.started_time.split("T")[0]; // Get the date part (YYYY-MM-DD)
      if (!formattedData[date]) {
        formattedData[date] = [];
      }
      formattedData[date].push({
        id: item.id,
        subject_name: item.subject_name,
        studyclassroom_name: item.studyclassroom_name,
        teacher_name: item.teacher_name,
        started_time: item.started_time.split("T")[1].split("Z")[0], // Get time part (HH:MM:SS)
        ended_time: item.ended_time.split("T")[1].split("Z")[0], // Get time part (HH:MM:SS)
        descriptions: item.descriptions,
      });
    });
    return formattedData;
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const renderItem = (item, isFirst) => {
    return (
      <TouchableOpacity
        style={[styles.item, isFirst ? styles.firstItem : null]}
      >
        <Text style={styles.itemText}>{item.subject_name}</Text>
        <Text style={styles.itemText}>
          Classroom: {item.studyclassroom_name}
        </Text>
        <Text style={styles.itemText}>Teacher: {item.teacher_name}</Text>
        <Text style={styles.itemText}>Start: {item.started_time}</Text>
        <Text style={styles.itemText}>End: {item.ended_time}</Text>
        <Text style={styles.itemText}>Descriptions: {item.descriptions}</Text>
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
});
