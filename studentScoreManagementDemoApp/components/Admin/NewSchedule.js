import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
  Alert,
  TouchableOpacity,
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { Button, Text, Surface } from "react-native-paper";
import { authApi, endpoints } from "../../configs/APIs";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "react-native-vector-icons/AntDesign";
import moment from "moment";

const NewSchedule = ({ navigation, route }) => {
  const token = route.params?.token;
  const user = route.params?.user;

  // Receive the passed startedDate and endedDate
  const passedStartedDate = route.params?.startedDate;
  const passedEndedDate = route.params?.endedDate;

  // Use the passed dates or default to the current date
  const [startedDate, setStartedDate] = useState(
    passedStartedDate
      ? moment(passedStartedDate, "DD/MM/YYYY").toDate()
      : new Date()
  );
  const [endedDate, setEndedDate] = useState(
    passedEndedDate
      ? moment(passedEndedDate, "DD/MM/YYYY").toDate()
      : new Date()
  );

  const [startedTime, setStartedTime] = useState(new Date());
  const [endedTime, setEndedTime] = useState(new Date());
  const [descriptions, setDescriptions] = useState("");

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);

  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [loading, setLoading] = useState(false);

  const [data, setData] = useState([]);
  const [value, setValue] = useState(null);
  const [studyclassrooms, setStudyClassRooms] = useState("");

  const setSchedule = async () => {
    setLoading(true);
    try {
      const url = `${endpoints["new-schedule"](value)}`;
      const data = {
        studyclassroom_id: value,
        started_time:
          moment(startedDate).format("YYYY-MM-DD") +
          " " +
          moment(startedTime).format("HH:mm:ss"),
        ended_time:
          moment(endedDate).format("YYYY-MM-DD") +
          " " +
          moment(endedTime).format("HH:mm:ss"),
        descriptions: descriptions,
      };

      const res = await authApi(token).post(url, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 201) {
        Alert.alert("Success", res.data.message);
        navigation.navigate("Home", {
          token: token,
          user: user,
        });
      } else {
        Alert.alert("Error", res.data.message);
      }
    } catch (error) {
      console.error(error);
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
    try {
      url = `${endpoints["studyclassrooms"](user.id)}`;
      const res = await authApi(token).get(url);
      const arr = res.data.results.map((item) => ({
        label: item.id + ": " + item.group_name + " - " + item.subject_name,
        value: item.id,
      }));
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

  useEffect(() => {
    loadStudyClassRooms();
  }, []);

  const handleItemChange = (item) => {
    setStudyClassRooms(item);
    setValue(item.value); // Reflect the selected value in the dropdown
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Lớp học:</Text>
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
        placeholder="Select Classroom"
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
      <Text style={styles.label}>Ngày bắt đầu (dd/MM/YYY):</Text>
      <TouchableOpacity
        onPress={() => setShowStartDatePicker(true)}
        style={styles.dateTimePicker}
      >
        <Text style={styles.dateTimePickerText}>
          {moment(startedDate).format("DD/MM/YYYY")}
        </Text>
      </TouchableOpacity>
      {showStartDatePicker && (
        <DateTimePicker
          value={startedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowStartDatePicker(false);
            if (date) setStartedDate(date);
          }}
        />
      )}

      <Text style={styles.label}>Thời gian bắt đầu (HH:mm:sss):</Text>
      <TouchableOpacity
        onPress={() => setShowStartTimePicker(true)}
        style={styles.dateTimePicker}
      >
        <Text style={styles.dateTimePickerText}>
          {moment(startedTime).format("HH:mm:ss")}
        </Text>
      </TouchableOpacity>
      {showStartTimePicker && (
        <DateTimePicker
          value={startedTime}
          mode="time"
          display="default"
          onChange={(event, time) => {
            setShowStartTimePicker(false);
            if (time) setStartedTime(time);
          }}
        />
      )}

      <Text style={styles.label}>Ngày kết thúc (dd/MM/YYY):</Text>
      <TouchableOpacity
        onPress={() => setShowEndDatePicker(true)}
        style={styles.dateTimePicker}
      >
        <Text style={styles.dateTimePickerText}>
          {moment(endedDate).format("DD/MM/YYYY")}
        </Text>
      </TouchableOpacity>
      {showEndDatePicker && (
        <DateTimePicker
          value={endedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowEndDatePicker(false);
            if (date) setEndedDate(date);
          }}
        />
      )}

      <Text style={styles.label}>Thời gian kết thúc (HH:mm:sss):</Text>
      <TouchableOpacity
        onPress={() => setShowEndTimePicker(true)}
        style={styles.dateTimePicker}
      >
        <Text style={styles.dateTimePickerText}>
          {moment(endedTime).format("HH:mm:ss")}
        </Text>
      </TouchableOpacity>
      {showEndTimePicker && (
        <DateTimePicker
          value={endedTime}
          mode="time"
          display="default"
          onChange={(event, time) => {
            setShowEndTimePicker(false);
            if (time) setEndedTime(time);
          }}
        />
      )}

      <Text style={styles.label}>Mô tả:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter descriptions"
        value={descriptions}
        onChangeText={setDescriptions}
        multiline={true}
      />

      <Button
        mode="contained"
        onPress={setSchedule}
        loading={loading}
        style={styles.button}
      >
        Tạo
      </Button>
    </ScrollView>
  );
};

export default NewSchedule;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f4f8", // Light background color for a fresh look
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333", // Darker text color for better readability
    fontWeight: "600",
  },
  dateTimePicker: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10, // Rounded corners for a friendlier look
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd", // Light border for definition
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // Subtle shadow for depth
  },
  dateTimePickerText: {
    fontSize: 16,
    color: "#007AFF", // Accent color for interactivity
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    fontSize: 16,
    color: "#333", // Consistent text color
  },
  button: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 25, // Rounded button for a modern feel
    backgroundColor: "#4CAF50", // Vibrant green color for action buttons
  },
  dropdown: {
    margin: 16,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  placeholderStyle: {
    fontSize: 16,
    color: "#999", // Softer placeholder color
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "#333",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: "#333",
  },
  item: {
    padding: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textItem: {
    fontSize: 16,
    color: "#333",
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: "#007AFF", // Match icon color with accent color
  },
});
