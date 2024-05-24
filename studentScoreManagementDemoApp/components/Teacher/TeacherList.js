import { ScrollView, Text, View } from "react-native";
import MyStyle from "../../styles/MyStyle";
import { Button } from "react-native-paper";
import Styles from "./Styles";

const TeacherList = () => {
  return (
    <View style={MyStyle.container}>
      <ScrollView>
        <View style={Styles.class}>
          <Text style={Styles.text_class}>Lớp: </Text>
          <Text style={Styles.text_class}>Môn: </Text>
          <Button
            style={MyStyle.button_user}
            mode="contained"
            onPress={() => console.log("Login")}
          >
            {" "}
            Quản lý điểm{" "}
          </Button>
        </View>

        <View style={Styles.class}>
          <Text style={Styles.text_class}>Lớp: </Text>
          <Text style={Styles.text_class}>Môn: </Text>
          <Button
            style={MyStyle.button_user}
            mode="contained"
            onPress={() => console.log("Login")}
          >
            {" "}
            Quản lý điểm{" "}
          </Button>
        </View>

        <View style={Styles.class}>
          <Text style={Styles.text_class}>Lớp: </Text>
          <Text style={Styles.text_class}>Môn: </Text>
          <Button
            style={MyStyle.button_user}
            mode="contained"
            onPress={() => console.log("Login")}
          >
            {" "}
            Quản lý điểm{" "}
          </Button>
        </View>

        <View style={Styles.class}>
          <Text style={Styles.text_class}>Lớp: </Text>
          <Text style={Styles.text_class}>Môn: </Text>
          <Button
            style={MyStyle.button_user}
            mode="contained"
            onPress={() => console.log("Login")}
          >
            {" "}
            Quản lý điểm{" "}
          </Button>
        </View>

        <View style={Styles.class}>
          <Text style={Styles.text_class}>Lớp: </Text>
          <Text style={Styles.text_class}>Môn: </Text>
          <Button
            style={MyStyle.button_user}
            mode="contained"
            onPress={() => console.log("Login")}
          >
            {" "}
            Quản lý điểm{" "}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

export default TeacherList;
