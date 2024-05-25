import React, { useContext } from "react";
import { View, Text, Alert } from "react-native";
import { Button, Avatar } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
import MyStyle from "../../styles/MyStyle";
import { MyDispatchContext, MyUserContext } from "../../configs/Contexts";
import Styles from "./Styles";

const Home = ({ navigation, route }) => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext);
  const token = route.params?.token;

  const picker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("iStudentScoreManagement", "Permissions Denied!");
    } else {
      let res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!res.canceled) {
        updateState("avatar", res.assets[0]);
      }
    }
  };

  const updateState = (field, value) => {
    dispatch({ type: "updateUser", payload: { field, value } });
  };

  let info_detail;
  let button_user;

  // Giao diện theo từng user
  switch (user.role) {
    case "student":
      info_detail = (
        <>
          <Text style={Styles.text_detail}>MSSV: {user.code}</Text>
          <Text style={Styles.text_detail}>Email: {user.email}</Text>
        </>
      );

      button_user = (
        <>
          <Button
            style={MyStyle.button_user}
            mode="contained"
            onPress={() =>
            navigation.navigate("StudyClassRooms", { token: token })
          }
          >
            Xem danh sách lớp học
          </Button>
          <Button
            style={MyStyle.button_user}
            mode="contained"
            onPress={() => navigation.navigate("ScoreDetails", { user: user })}
          >
            Xem điểm
          </Button>
        </>
      );
      break;

    case "teacher":
      info_detail = (
        <>
          <Text style={Styles.text_detail}>Email: {user.email}</Text>
        </>
      );

      button_user = (
        <Button
          style={MyStyle.button_user}
          mode="contained"
          onPress={() =>
            navigation.navigate("StudyClassRooms", { token: token })
          }
        >
          Xem danh sách lớp học
        </Button>
      );
      break;

    case "admin":
      info_detail = <Text style={Styles.text_detail}>Email: {user.email}</Text>;
      button_user = (
        <Button
          style={MyStyle.button_user}
          mode="contained"
          onPress={() => navigation.navigate("Admin")}
        >
          Đăng ký tài khoản
        </Button>
      );
      break;
  }

  return (
    <View style={[MyStyle.container, MyStyle.centerContainer]}>
      <View style={Styles.avatar}>
        {user.avatar && (
          <Avatar.Image
          size={250}
          source={{ uri:user.avatar.uri }}
        />
        )}
        <Button style={Styles.avatar_button} mode="contained" onPress={picker}>
          <Icon name="camera" size={20} color="#000" />
        </Button>
      </View>
      <View style={Styles.info}>
        <Text style={Styles.text_name}>
          {user.last_name} {user.first_name}
        </Text>
        <View style={Styles.info_detail}>{info_detail}</View>
      </View>
      <View style={Styles.log_items}>
        {button_user}
        <Button
          style={MyStyle.button_user}
          mode="contained"
          onPress={() => navigation.navigate("Chat")}
        >
          Chat
        </Button>
        <Button
          style={MyStyle.button_user}
          mode="contained"
          onPress={() => dispatch({ type: "logout" })}
        >
          Đăng xuất
        </Button>
      </View>
    </View>
  );
};

export default Home;
