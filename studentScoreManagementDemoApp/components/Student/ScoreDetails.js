import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { authApi, endpoints } from "../../configs/APIs";
import MyStyle from "../../styles/MyStyle";
import { Searchbar } from "react-native-paper";
import { Table, TableWrapper, Row, Rows, Col } from "react-native-table-component";

const ScoreDetails = ({ navigaiton, route }) => {
  const token = route.params?.token;
  const user = route.params?.user;

  const [loading, setLoading] = useState(false);
  const [studies, setStudies] = useState([]);
  const [kw, setKw] = useState("");

  const [page, setPage] = useState(1);

  const tableHead = ["STT", "Tên môn học", "Nhóm lớp", "Điểm GK", "Điểm CK"];
  const widthArr = [40, 400, 100, 100, 100];

  const groupedSubjects = studies.reduce((subject, curr) => {
    const subjectName = curr.subject_name;

    const existingSubject = subject.find(c => c.subject_name === subjectName);

    if (existingSubject) {
      if (curr.scorecolumn_type === "Điểm GK") {
        existingSubject.score_mid = curr.score;
      } else if (curr.scorecolumn_type === "Điểm CK") {
        existingSubject.score_end = curr.score;
      }
    } else {
      subject.push({
        subject_name: subjectName,
        group_name: curr.group_name,
        semester_name: curr.semester_name,
        semester_year: curr.semester_year,
        score_mid: curr.scorecolumn_type === "Điểm GK" ? curr.score : "",
        score_end: curr.scorecolumn_type === "Điểm CK" ? curr.score : "",
      });
    }

    return subject;
  }, []);

  const loadStudies = async () => {
    if (page > 0) {
      try {
        setLoading(true);
        let url = `${endpoints["studies"](user.id)}?page=${page}`;
        if (kw) {
          url = `${endpoints["studies"](user.id)}?kw=${kw}&page=${page}`;
        }
        let res = await authApi(token).get(url);
        console.log(res.data.results);
        if (page === 1) setStudies(res.data.results);
        else if (page > 1)
          setStudies((current) => {
            return [...current, ...res.data.results];
          });
        setStudies(res.data.results);
        if (res.data.next === null) setPage(0);
      } catch (ex) {
        console.error(ex);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadStudies();
  }, [kw, page]);

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  const loadMore = ({ nativeEvent }) => {
    if (loading === false && isCloseToBottom(nativeEvent)) {
      setPage(page + 1);
    }
  };

  const search = (value, callback) => {
    setPage(1);
    callback(value);
  };

  return (
    <View style={[MyStyle.container, MyStyle.centerContainer]}>
      <Searchbar
        onChangeText={(t) => search(t, setKw)}
        value={kw}
        placeholder="Tìm theo kiếm môn học"
      ></Searchbar>

      <ScrollView onScroll={loadMore}>
        <RefreshControl onRefresh={() => loadStudies} />
        {loading && page === 1 && <ActivityIndicator />}

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
                        data={[index + 1, c.subject_name, c.group_name, c.score_mid, c.score_end]}
                        style={MyStyle.body}
                        textStyle={MyStyle.text}
                        widthArr={widthArr}
                      />
                    ))
                  ) : (
                    <Row
                      data={['', '', '', '', '']}
                      style={MyStyle.body}
                      textStyle={MyStyle.text}
                      widthArr={widthArr}
                    />
                  )}
                </Table>
              </View>
          </ScrollView>

        {loading && page > 1 && <ActivityIndicator />}

      </ScrollView>
    </View>
  );
};
export default ScoreDetails;