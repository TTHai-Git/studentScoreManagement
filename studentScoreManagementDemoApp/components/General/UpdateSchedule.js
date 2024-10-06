import DateTimePicker from "@react-native-community/datetimepicker";
import { useContext, useState } from "react";
import {
  Alert,
  TouchableOpacity,
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { Button, Text, Surface } from "react-native-paper";
import { authApi, endpoints } from "../../configs/APIs";
import { MyUserContext } from "../../configs/Contexts";

const UpdateSchedule = ({ navigation, route }) => {
  const user = useContext(MyUserContext);
  const item_id = route.params?.item_id;

  const [startedDate, setStartedDate] = useState(new Date());
  const [startedTime, setStartedTime] = useState(new Date());

  const [endedDate, setEndedDate] = useState(new Date());
  const [endedTime, setEndedTime] = useState(new Date());

  const [descriptions, setDescriptions] = useState("");
  const [loading, setLoading] = useState(false);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);

  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const setSchedule = async () => {
    setLoading(true);
    try {
      const url = `${endpoints["update-schedule"](item_id)}`;
      const data = {
        started_time:
          startedDate.toLocaleDateString("en-CA") +
          " " +
          startedTime.toLocaleTimeString("en-GB", { hour12: false }),
        ended_time:
          endedDate.toLocaleDateString("en-CA") +
          " " +
          endedTime.toLocaleTimeString("en-GB", { hour12: false }),
        descriptions: descriptions,
      };

      const res = await authApi(user.access_token).patch(url, data);

      if (res.status === 200) {
        Alert.alert("Success", res.data.message);
        navigation.navigate("Home");
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
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

  const handleStartedDateChange = (event, selectedDate) => {
    if (event.type === "set" && selectedDate) {
      setStartedDate(selectedDate);
    }
    setShowStartDatePicker(false);
  };

  const handleStartedTimeChange = (event, selectedTime) => {
    if (event.type === "set" && selectedTime) {
      setStartedTime(selectedTime);
    }
    setShowStartTimePicker(false);
  };

  const handleEndedDateChange = (event, selectedDate) => {
    if (event.type === "set" && selectedDate) {
      setEndedDate(selectedDate);
    }
    setShowEndDatePicker(false);
  };

  const handleEndedTimeChange = (event, selectedTime) => {
    if (event.type === "set" && selectedTime) {
      setEndedTime(selectedTime);
    }
    setShowEndTimePicker(false);
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.surface}>
        <TouchableOpacity
          style={styles.pickerContainer}
          onPress={() => setShowStartDatePicker(true)}
        >
          <Text style={styles.pickerLabel}>Ngày bắt đầu (dd/MM/YYYY):</Text>
          <Text style={styles.pickerValue}>
            {new Intl.DateTimeFormat("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).format(startedDate)}
          </Text>
        </TouchableOpacity>
        {showStartDatePicker && (
          <DateTimePicker
            mode={"date"}
            value={startedDate}
            onChange={handleStartedDateChange}
          />
        )}

        <TouchableOpacity
          style={styles.pickerContainer}
          onPress={() => setShowStartTimePicker(true)}
        >
          <Text style={styles.pickerLabel}>Thời gian bắt đầu (HH:mm:ss):</Text>
          <Text style={styles.pickerValue}>
            {startedTime.toLocaleTimeString()}
          </Text>
        </TouchableOpacity>
        {showStartTimePicker && (
          <DateTimePicker
            mode={"time"}
            value={startedTime}
            onChange={handleStartedTimeChange}
          />
        )}

        <TouchableOpacity
          style={styles.pickerContainer}
          onPress={() => setShowEndDatePicker(true)}
        >
          <Text style={styles.pickerLabel}>Ngày kết thúc (dd/MM/YYYY):</Text>
          <Text style={styles.pickerValue}>
            {new Intl.DateTimeFormat("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).format(endedDate)}
          </Text>
        </TouchableOpacity>
        {showEndDatePicker && (
          <DateTimePicker
            mode={"date"}
            value={endedDate}
            onChange={handleEndedDateChange}
          />
        )}

        <TouchableOpacity
          style={styles.pickerContainer}
          onPress={() => setShowEndTimePicker(true)}
        >
          <Text style={styles.pickerLabel}>Thời gian kết thúc (HH:mm:ss):</Text>
          <Text style={styles.pickerValue}>
            {endedTime.toLocaleTimeString()}
          </Text>
        </TouchableOpacity>
        {showEndTimePicker && (
          <DateTimePicker
            mode={"time"}
            value={endedTime}
            onChange={handleEndedTimeChange}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Hãy mô tả..."
          value={descriptions}
          onChangeText={setDescriptions}
          multiline={true}
        />

        <Button
          style={styles.submitButton}
          icon="account"
          mode="contained"
          onPress={setSchedule}
          loading={loading}
        >
          Cập Nhật
        </Button>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f4f4f4",
  },
  surface: {
    padding: 16,
    borderRadius: 8,
    elevation: 4,
    backgroundColor: "white",
  },
  pickerContainer: {
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#cccccc",
    backgroundColor: "#f9f9f9",
  },
  pickerLabel: {
    fontSize: 14,
    color: "#777777",
  },
  pickerValue: {
    fontSize: 16,
    color: "#333333",
    marginTop: 4,
  },
  input: {
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#cccccc",
    backgroundColor: "#f9f9f9",
    fontSize: 16,
  },
  submitButton: {
    marginTop: 16,
  },
});

export default UpdateSchedule;
