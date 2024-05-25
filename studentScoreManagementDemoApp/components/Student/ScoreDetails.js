import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { authApi, endpoints } from "../../configs/APIs";
import MyStyle from "../../styles/MyStyle";
import { Searchbar } from "react-native-paper";

const ScoreDetails = ({ navigaiton, route }) => {
  const token = route.params?.token;
  const user = route.params?.user;

  const [loading, setLoading] = useState(false);
  const [studies, setStudies] = useState([]);
  const [kw, setKw] = useState("");

  const [page, setPage] = useState(1);

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
  }, []);

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
      <ScrollView onScroll={loadMore}>
        <Searchbar
          onChangeText={(t) => search(t, setKw)}
          value={kw}
          placeholder="Tìm theo kiếm môn học ..."
        ></Searchbar>

        <RefreshControl onRefresh={() => loadStudents} />
        {loading && <ActivityIndicator />}
        {studies.map((c) => {
          return (
            <TouchableOpacity key={c.id}>
              <Text>Nhóm lớp: {c.group_name}</Text>
              <Text>Tên môn học: {c.subject_name}</Text>
              <Text>Học kỳ: {c.semester_name}</Text>
              <Text>Năm học: {c.semester_year}</Text>
              <Text>Loại Cột Điểm: {c.scorecolumn_type}</Text>
              <Text>Trọng số: {c.scorecolumn_percent}</Text>
              <Text>Điểm: {c.score}</Text>
            </TouchableOpacity>
          );
        })}
        {loading && page > 1 && <ActivityIndicator />}
      </ScrollView>
    </View>
  );
};
export default ScoreDetails;

// import { ScrollView, View } from "react-native";
// import MyStyle from "../../styles/MyStyle";
// import {
//   Table,
//   TableWrapper,
//   Row,
//   Rows,
//   Col,
// } from "react-native-table-component";
// import { Text } from "react-native-paper";
// import Styles from "../Student/Styles";
// import React from "react";

// const Student = () => {
//   const tableHead = ["STT", "Mã MH", "Tên MH", "Điểm GK", "Điểm CK"];
//   const tableData = [
//     [
//       "1",
//       "DEDU0103",
//       "Giáo dục quốc phòng và an ninh: Quân sự chung",
//       "4 10 10",
//       "5 10 10",
//     ],
//     [
//       "1",
//       "DEDU0103",
//       "Giáo dục quốc phòng và an ninh: Quân sự chung",
//       "4 10 10",
//       "5 10 10",
//     ],
//     [
//       "1",
//       "DEDU0103",
//       "Giáo dục quốc phòng và an ninh: Quân sự chung",
//       "4 10 10",
//       "5 10 10",
//     ],
//   ];
//   const widthArr = [40, 100, 500, 100, 100]; // Đặt chiều rộng cho mỗi cột

//   return (
//     <View style={MyStyle.container}>
//       {/* Cho phép kéo dọc tổng */}
//       <ScrollView>
//         {/* Cho phép kéo ngang từng học kỳ */}
//         <ScrollView horizontal={true}>
//           <View style={Styles.table}>
//             <Text style={Styles.semesterText} variant="headlineSmall">
//               Học kỳ ...
//             </Text>
//             <Table borderStyle={{ borderWidth: 1, borderColor: "#000" }}>
//               <Row
//                 data={tableHead}
//                 style={Styles.head}
//                 textStyle={{ ...Styles.text, fontWeight: "bold" }}
//                 widthArr={widthArr}
//               />
//               <Rows
//                 data={tableData}
//                 style={Styles.body}
//                 textStyle={Styles.text}
//                 widthArr={widthArr}
//               />
//             </Table>
//           </View>
//         </ScrollView>

//         {/* Cho phép kéo ngang từng học kỳ */}
//         <ScrollView horizontal={true}>
//           <View style={Styles.table}>
//             <Text style={Styles.semesterText} variant="headlineSmall">
//               Học kỳ ...
//             </Text>
//             <Table borderStyle={{ borderWidth: 1, borderColor: "#000" }}>
//               <Row
//                 data={tableHead}
//                 style={Styles.head}
//                 textStyle={{ ...Styles.text, fontWeight: "bold" }}
//                 widthArr={widthArr}
//               />
//               <Rows
//                 data={tableData}
//                 style={Styles.body}
//                 textStyle={Styles.text}
//                 widthArr={widthArr}
//               />
//             </Table>
//           </View>
//         </ScrollView>

//         {/* Cho phép kéo ngang từng học kỳ */}
//         <ScrollView horizontal={true}>
//           <View style={Styles.table}>
//             <Text style={Styles.semesterText} variant="headlineSmall">
//               Học kỳ ...
//             </Text>
//             <Table borderStyle={{ borderWidth: 1, borderColor: "#000" }}>
//               <Row
//                 data={tableHead}
//                 style={Styles.head}
//                 textStyle={{ ...Styles.text, fontWeight: "bold" }}
//                 widthArr={widthArr}
//               />
//               <Rows
//                 data={tableData}
//                 style={Styles.body}
//                 textStyle={Styles.text}
//                 widthArr={widthArr}
//               />
//             </Table>
//           </View>
//         </ScrollView>
//       </ScrollView>
//     </View>
//   );
// };

// export default Student;

