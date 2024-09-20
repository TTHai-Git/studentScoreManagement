import {
  ActivityIndicator,
  Text,
  View,
  Dimensions,
  StyleSheet,
  Alert,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { useEffect, useState, useCallback, useContext } from "react";
import { authApi, endpoints } from "../../configs/APIs";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "react-native-vector-icons/AntDesign";
import { MyUserContext } from "../../configs/Contexts";

const EvaluateLearningResults = () => {
  const user = useContext(MyUserContext);
  const [GPA, setGPA] = useState([]);
  const [semester, setSemester] = useState([]);
  const [loading, setLoading] = useState(false);

  const [kw, setKw] = useState("");
  const [value, setValue] = useState(null);
  const [data, setData] = useState([]);

  const loadLearningResults = async () => {
    try {
      setLoading(true);
      let url = `${endpoints["evaluate-learning-results"](user.id)}`;
      if (kw) {
        url += `?kw=${kw}`;
      }
      const res = await authApi(user.access_token).get(url);
      // console.log(res.data.results)
      const arrGPA = res.data.results.map((item) => item.GPA);
      const arrSemester = res.data.results.map((item) => item.semester_name);
      setGPA(arrGPA);
      setSemester(arrSemester);
    } catch (error) {
      // console.log(error.response);
      if (error.response && error.response.data) {
        setGPA([0, 0, 0]);
        setSemester(["I", "II", "III"]);
        Alert.alert("Error", error.response.data.message);
      } else {
        Alert.alert("Error", "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadYears = async () => {
    try {
      const url = `${endpoints["years"]}`;
      const res = await authApi(user.access_token).get(url);
      const arr = res.data.results.map((item) => ({
        label: item.name,
        value: item.name,
      }));
      setData(arr);
    } catch (error) {
      // console.log(error.response);
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
    if (kw) {
      loadLearningResults();
    }
  }, [kw]);

  useEffect(() => {
    loadYears();
  }, []);

  const screenWidth = Dimensions.get("window").width;

  const data_fake = {
    labels: ["I", "II", "III"],
    datasets: [
      {
        data: [0.0, 0.0, 0.0],
        colors: [
          (opacity = 1) => `rgba(135, 206, 250, ${opacity})`,
          (opacity = 1) => `rgba(173, 216, 230, ${opacity})`,
          (opacity = 1) => `rgba(144, 238, 144, ${opacity})`,
          (opacity = 1) => `rgba(255, 182, 193, ${opacity})`,
          (opacity = 1) => `rgba(255, 228, 181, ${opacity})`,
          (opacity = 1) => `rgba(221, 160, 221, ${opacity})`,
        ],
      },
    ],
    legend: ["Rainy Days"],
  };

  const data_real = {
    labels: semester,
    datasets: [
      {
        data: GPA,
        colors: [
          (opacity = 1) => `rgba(135, 206, 250, ${opacity})`,
          (opacity = 1) => `rgba(173, 216, 230, ${opacity})`,
          (opacity = 1) => `rgba(144, 238, 144, ${opacity})`,
          (opacity = 1) => `rgba(255, 182, 193, ${opacity})`,
          (opacity = 1) => `rgba(255, 228, 181, ${opacity})`,
          (opacity = 1) => `rgba(221, 160, 221, ${opacity})`,
        ],
      },
    ],
    legend: ["ĐÁNH GIÁ KẾT QUẢ HỌC TẬP"],
  };

  const chartConfig = {
    backgroundGradientFrom: "#f0f0f0",
    backgroundGradientTo: "#fafafa",
    color: (opacity = 1) => `rgba(33, 33, 33, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    fillShadowGradient: "#69b4ff",
    fillShadowGradientOpacity: 1,
    propsForBackgroundLines: {
      strokeDasharray: "", // solid background lines with no dashes
      strokeWidth: 1,
      stroke: "#e0e0e0",
    },
  };

  const renderItem = useCallback((item) => {
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
  }, []);

  const handleItemChange = (item) => {
    setKw(item.value);
  };

  return (
    <View style={styles.container}>
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
        placeholder="Chọn năm học..."
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
      <Text style={styles.title}>Đánh giá kết quả học tập</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#6200ea" />
      ) : (
        <View style={styles.chartContainer}>
          {GPA.length === 0 && !loading ? (
            <Text style={styles.noDataText}>
              Vui lòng chọn năm học để xem GPA cả năm
            </Text>
          ) : (
            <View style={styles.chartWrapper}>
              <Text style={styles.yAxisLabel}>GPA</Text>
              <BarChart
                data={
                  GPA.length > 0 && semester.length > 0 ? data_real : data_fake
                }
                width={screenWidth - 60} // Adjusted for space for the Y axis label
                height={300}
                verticalLabelRotation={30}
                chartConfig={chartConfig}
                style={styles.chart}
                fromZero={true}
                showBarTops={true}
                withHorizontalLabels={true}
                segments={4} // Number of horizontal lines in the chart
              />
              <Text style={styles.xAxisLabel}>Semester</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  chartWrapper: {
    flex: 1,
    alignItems: "center",
  },
  yAxisLabel: {
    transform: [{ rotate: "-90deg" }],
    position: "absolute",
    left: -30,
    top: "40%",
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
  xAxisLabel: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
  chart: {
    marginVertical: 10,
    borderRadius: 15,
  },
  dropdown: {
    margin: 16,
    height: 50,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
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
    color: "#999",
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
  },
  noDataText: {
    fontSize: 18,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
});

export default EvaluateLearningResults;
