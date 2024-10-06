import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";
import { authApi, endpoints } from "../../configs/APIs";
import MyStyle from "../../styles/MyStyle";
import { Searchbar } from "react-native-paper";
import { Table, Row } from "react-native-table-component";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "react-native-vector-icons/AntDesign";
import { MyUserContext } from "../../configs/Contexts";

const ScoreDetails = () => {
  const user = useContext(MyUserContext);

  const [loading, setLoading] = useState(false);
  const [studies, setStudies] = useState([]);
  const [kw, setKw] = useState("");
  const [scoreTypes, setScoreTypes] = useState([]);
  const [widthArr, setWidthArr] = useState([40, 400, 100]);

  const [semester, setSemester] = useState("");
  const [data, setData] = useState([]);
  const [value, setValue] = useState(null);

  const loadStudyResult = async () => {
    try {
      setLoading(true);
      let url = `${endpoints["studies"](user.id)}?`;

      if (kw) {
        url += `kw=${kw}`;
      } else if (semester && semester !== "Show All") {
        url += `semester=${semester}`;
      }

      let res = await authApi(user.access_token).get(url);

      if (res.data.message) {
        Alert.alert("Notification", res.data.message);
        setStudies([]);
        setScoreTypes([]);
        setWidthArr([40, 400, 100]);
        return;
      }

      setStudies(res.data.studyresult);

      // Extract unique score types
      const types = new Set();
      res.data.studyresult.forEach((study) => {
        study.scoredetails?.forEach((detail) => {
          types.add(detail.col_type);
        });
      });

      const scoreTypesArray = Array.from(types);
      setScoreTypes(scoreTypesArray);

      // Adjust widthArr dynamically
      setWidthArr([
        40,
        100,
        200,
        70,
        100,
        100,
        ...Array(scoreTypesArray.length).fill(120),
        120,
        120,
        100,
      ]);
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

  const loadSemester = async () => {
    try {
      const url = `${endpoints["list-semester"]}`;
      const res = await authApi(user.access_token).get(url);
      const arr = res.data.results.map((item) => ({
        label: item.name + " " + item.year,
        value: item.name + " " + item.year,
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
        {item.value === semester && (
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

  useEffect(() => {
    loadStudyResult();
  }, [kw, semester]);

  useEffect(() => {
    loadSemester();
  }, []);

  const search = (value) => {
    setKw(value);
  };

  const handleItemChange = (item) => {
    setSemester(item.value);
    if (item.value === "Show All") {
      setKw("");
    }
  };

  const tableHead = [
    "STT",
    "Mã môn học",
    "Tên môn học",
    "Học kỳ",
    "Năm học",
    ...scoreTypes,
    "Điểm Thang 10",
    "Điểm Thang 4",
    "Điểm Chữ",
    "Kết Quả",
  ];

  const groupedSubjects = studies.map((curr) => {
    const scores = {};

    curr.scoredetails?.forEach((scoreDetail) => {
      scores[scoreDetail.col_type] = scoreDetail.score;
    });

    // Determine the icon to be displayed based on the result
    const resultIcon = curr.result ? (
      <AntDesign name="checkcircle" size={20} color="green" />
    ) : (
      <AntDesign name="closecircle" size={20} color="red" />
    );

    return {
      subject_code: curr.subject_code,
      subject_name: curr.subject_name,
      semester_name: curr.semester_name,
      semester_year: curr.semester_year,
      scores,
      ten_point_scale: curr.ten_point_scale,
      four_point_scale: curr.four_point_scale,
      grade: curr.grade,
      result: resultIcon, // Use the resultIcon here
    };
  });

  return (
    <View style={[MyStyle.container]}>
      <Searchbar
        onChangeText={(t) => search(t)}
        value={kw}
        placeholder="Tìm kiếm môn học"
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
        placeholder="Chọn học kỳ và năm học..."
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

      {studies.length === 0 && !loading ? (
        <Text>
          Không có kết quả học tập nào hoặc giảng viên chưa khóa điểm nên sinh
          viên chưa thể xem điểm được!!!
        </Text>
      ) : (
        <ScrollView horizontal={true}>
          <ScrollView style={{ flex: 1 }}>
            <View style={MyStyle.table}>
              <Table borderStyle={{ borderWidth: 1, borderColor: "#000" }}>
                <Row
                  data={tableHead}
                  style={MyStyle.head}
                  textStyle={{ ...MyStyle.text, fontWeight: "bold" }}
                  widthArr={widthArr}
                />
                {groupedSubjects.length > 0 ? (
                  groupedSubjects.map((c, index) => (
                    <Row
                      key={index + 1}
                      data={[
                        index + 1,
                        c.subject_code,
                        c.subject_name,
                        c.semester_name,
                        c.semester_year,
                        ...scoreTypes.map((type) => c.scores[type] || ""),
                        c.ten_point_scale,
                        c.four_point_scale,
                        c.grade,
                        c.result,
                      ]}
                      style={MyStyle.body}
                      textStyle={MyStyle.text}
                      widthArr={widthArr}
                    />
                  ))
                ) : (
                  <Row
                    data={["", "", "", ...Array(scoreTypes.length).fill("")]}
                    style={MyStyle.body}
                    textStyle={MyStyle.text}
                    widthArr={widthArr}
                  />
                )}
              </Table>
            </View>
          </ScrollView>
        </ScrollView>
      )}
      {loading && <ActivityIndicator size="large" />}
    </View>
  );
};

export default ScoreDetails;

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
