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

  const tableHead = ["STT", "Tên môn học", "Nhóm lớp", "Điểm GK", "Điểm CK"];
  const widthArr = [40, 400, 100, 100, 100];

  const groupedSubjects = studies.reduce((subject, curr) => {
    const subjectName = curr.subject_name;

    const existingSubject = subject.find((c) => c.subject_name === subjectName);

    if (existingSubject) {
      if (curr.scorecolumn_type === "Giữa Kỳ") {
        existingSubject.score_mid = curr.score;
      } else if (curr.scorecolumn_type === "Cuối Kỳ") {
        existingSubject.score_end = curr.score;
      }
    } else {
      subject.push({
        subject_name: subjectName,
        group_name: curr.group_name,
        semester_name: curr.semester_name,
        semester_year: curr.semester_year,
        score_mid: curr.scorecolumn_type === "Giữa Kỳ" ? curr.score : "",
        score_end: curr.scorecolumn_type === "Cuối Kỳ" ? curr.score : "",
      });
    }

    return subject;
  }, []);

  const loadStudies = async () => {
    try {
      setLoading(true);
      let url = `${endpoints["studies"](user.id)}`;
      if (kw) {
        url = `${endpoints["studies"](user.id)}?kw=${kw}`;
      }
      let res = await authApi(token).get(url);
      console.log(res.data);
      setStudies(res.data);
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudies();
  }, [kw]);

  const search = (value, callback) => {
    setPage(1);
    callback(value);
  };

  return (
    <View style={[MyStyle.container, MyStyle.centerContainer]}>
      {studies.length === 0 && !loading ? (
        <Text>
          Không có kết quả học tập nào hoặc giảng viên chưa khóa điểm nên sinh
          viên chưa thể xem điểm được!!!
        </Text>
      ) : (
        <>
          <Searchbar
            onChangeText={(t) => search(t, setKw)}
            value={kw}
            placeholder="Tìm theo kiếm môn học"
          />

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
                        index,
                        c.subject_name,
                        c.group_name,
                        c.score_mid,
                        c.score_end,
                      ]}
                      style={MyStyle.body}
                      textStyle={MyStyle.text}
                      widthArr={widthArr}
                    />
                  ))
                ) : (
                  <Row
                    data={["", "", "", "", ""]}
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
