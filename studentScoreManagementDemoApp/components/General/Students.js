import { ScrollView, View } from "react-native";
import MyStyle from "../../styles/MyStyle";
import {
  Table,
  TableWrapper,
  Row,
  Rows,
  Col,
} from "react-native-table-component";
import { Text } from "react-native-paper";
import Styles from "../Student/Styles";
import React from "react";

const Student = () => {
  const tableHead = ["STT", "Mã MH", "Tên MH", "Điểm GK", "Điểm CK"];
  const tableData = [
    [
      "1",
      "DEDU0103",
      "Giáo dục quốc phòng và an ninh: Quân sự chung",
      "4 10 10",
      "5 10 10",
    ],
    [
      "1",
      "DEDU0103",
      "Giáo dục quốc phòng và an ninh: Quân sự chung",
      "4 10 10",
      "5 10 10",
    ],
    [
      "1",
      "DEDU0103",
      "Giáo dục quốc phòng và an ninh: Quân sự chung",
      "4 10 10",
      "5 10 10",
    ],
  ];
  const widthArr = [40, 100, 500, 100, 100]; // Đặt chiều rộng cho mỗi cột

  return (
    <View style={MyStyle.container}>
      {/* Cho phép kéo dọc tổng */}
      <ScrollView>
        {/* Cho phép kéo ngang từng học kỳ */}
        <ScrollView horizontal={true}>
          <View style={Styles.table}>
            <Text style={Styles.semesterText} variant="headlineSmall">
              Học kỳ ...
            </Text>
            <Table borderStyle={{ borderWidth: 1, borderColor: "#000" }}>
              <Row
                data={tableHead}
                style={Styles.head}
                textStyle={{ ...Styles.text, fontWeight: "bold" }}
                widthArr={widthArr}
              />
              <Rows
                data={tableData}
                style={Styles.body}
                textStyle={Styles.text}
                widthArr={widthArr}
              />
            </Table>
          </View>
        </ScrollView>

        {/* Cho phép kéo ngang từng học kỳ */}
        <ScrollView horizontal={true}>
          <View style={Styles.table}>
            <Text style={Styles.semesterText} variant="headlineSmall">
              Học kỳ ...
            </Text>
            <Table borderStyle={{ borderWidth: 1, borderColor: "#000" }}>
              <Row
                data={tableHead}
                style={Styles.head}
                textStyle={{ ...Styles.text, fontWeight: "bold" }}
                widthArr={widthArr}
              />
              <Rows
                data={tableData}
                style={Styles.body}
                textStyle={Styles.text}
                widthArr={widthArr}
              />
            </Table>
          </View>
        </ScrollView>

        {/* Cho phép kéo ngang từng học kỳ */}
        <ScrollView horizontal={true}>
          <View style={Styles.table}>
            <Text style={Styles.semesterText} variant="headlineSmall">
              Học kỳ ...
            </Text>
            <Table borderStyle={{ borderWidth: 1, borderColor: "#000" }}>
              <Row
                data={tableHead}
                style={Styles.head}
                textStyle={{ ...Styles.text, fontWeight: "bold" }}
                widthArr={widthArr}
              />
              <Rows
                data={tableData}
                style={Styles.body}
                textStyle={Styles.text}
                widthArr={widthArr}
              />
            </Table>
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
};

export default Student;
