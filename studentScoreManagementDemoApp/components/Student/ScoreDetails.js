import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { authApi, endpoints } from "../../configs/APIs";
import MyStyle from "../../styles/MyStyle";
import { Searchbar } from "react-native-paper";
import { Table, Row } from "react-native-table-component";

const ScoreDetails = ({ navigation, route }) => {
  const token = route.params?.token;
  const user = route.params?.user;

  const [loading, setLoading] = useState(false);
  const [studies, setStudies] = useState([]);
  const [kw, setKw] = useState("");

  const [scoreTypes, setScoreTypes] = useState([]);
  const [widthArr, setWidthArr] = useState([40, 400, 100]);

  const loadStudyResult = async () => {
    try {
      setLoading(true);
      let url = `${endpoints["studies"](user.id)}`;
      if (kw) {
        url = `${endpoints["studies"](user.id)}?kw=${kw}`;
      }
      let res = await authApi(token).get(url);

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
        100,
        100,
        ...Array(scoreTypesArray.length).fill(100),
      ]);
    } catch (ex) {
      // console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudyResult();
  }, [kw]);

  const search = (value, callback) => {
    setKw(value);
    callback(value);
  };

  const tableHead = ["STT", "Tên môn học", "Học kỳ", "Năm học", ...scoreTypes];

  const groupedSubjects = studies.map((curr) => {
    const scores = {};

    curr.scoredetails?.forEach((scoreDetail) => {
      scores[scoreDetail.col_type] = scoreDetail.score;
    });

    return {
      subject_name: curr.subject_name,
      semester_name: curr.semester_name,
      semester_year: curr.semester_year,
      scores,
    };
  });

  return (
    <View style={[MyStyle.container, MyStyle.centerContainer]}>
      <Searchbar
        onChangeText={(t) => search(t, setKw)}
        value={kw}
        placeholder="Tìm theo kiếm môn học"
      />
      {studies.length === 0 && !loading ? (
        <Text>
          Không có kết quả học tập nào hoặc giảng viên chưa khóa điểm nên sinh
          viên chưa thể xem điểm được!!!
        </Text>
      ) : (
        <>
          <ScrollView horizontal={true}>
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
                      key={index}
                      data={[
                        index + 1, // Increment by 1 for 1-based indexing
                        c.subject_name,
                        c.semester_name,
                        c.semester_year,
                        ...scoreTypes.map((type) => c.scores[type] || ""),
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
        </>
      )}
    </View>
  );
};

export default ScoreDetails;
