import React, { useContext, useState } from "react";
import { View, Text, Alert, Image, ActivityIndicator } from "react-native";
import { Button, Avatar } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
import MyStyle from "../../styles/MyStyle";
import { MyDispatchContext, MyUserContext } from "../../configs/Contexts";
import Styles from "./Styles";
import { authApi, endpoints } from "../../configs/APIs";
import { logOutFireBaseUser } from "../../configs/Reducers";
import { ScrollView } from "react-native-gesture-handler";

const Home = ({ navigation, route }) => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext);
  const token = route.params?.token;
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const updateState = (field, value) => {
    dispatch({ type: "updateUser", payload: { field, value } });
  };

  const picker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("iStudentScoreManagement", "Permissions Denied!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      const selectedAsset = result.assets[0];
      setSelectedImage(selectedAsset.uri);

      const formData = new FormData();
      formData.append("avatar", {
        uri: selectedAsset.uri,
        name: "userProfile.jpg",
        type: "image/jpeg",
      });

      try {
        setLoading(true);
        const res = await authApi(token).patch(
          endpoints["current-user"],
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (res.status === 200) {
          Alert.alert("Avatar updated successfully!");
          updateState("avatar", selectedAsset.uri);
        } else {
          Alert.alert("Failed to upload avatar. Please try again!");
        }
      } catch (ex) {
        console.error(ex);
        Alert.alert("An error occurred. Please try again later!");
      } finally {
        setLoading(false);
      }
    }
  };

  let info_detail;
  let button_user;

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
              navigation.navigate("StudyClassRooms", {
                token: token,
                user: user,
              })
            }
          >
            Xem danh sách lớp học
          </Button>
          <Button
            style={MyStyle.button_user}
            mode="contained"
            onPress={() =>
              navigation.navigate("ScheduleStudyClassrooms", {
                token: token,
                user: user,
              })
            }
          >
            Xem lịch học
          </Button>
          <Button
            style={MyStyle.button_user}
            mode="contained"
            onPress={() =>
              navigation.navigate("RegisterStudy", {
                token: token,
                user: user,
              })
            }
          >
            Đăng Ký Lớp Học
          </Button>
          <Button
            style={MyStyle.button_user}
            mode="contained"
            onPress={() =>
              navigation.navigate("ScoreDetails", { token: token, user: user })
            }
          >
            Xem điểm
          </Button>
        </>
      );
      break;

    case "teacher":
      info_detail = (
        <>
          <Text style={Styles.text_detail}>MGV: {user.code}</Text>
          <Text style={Styles.text_detail}>Email: {user.email}</Text>
        </>
      );

      button_user = (
        <>
          <Button
            style={MyStyle.button_user}
            mode="contained"
            onPress={() =>
              navigation.navigate("StudyClassRooms", {
                token: token,
                user: user,
              })
            }
          >
            Xem danh sách lớp học
          </Button>
          <Button
            style={MyStyle.button_user}
            mode="contained"
            onPress={() =>
              navigation.navigate("ScheduleStudyClassrooms", {
                token: token,
                user: user,
              })
            }
          >
            Xem Lịch Giảng Dạy
          </Button>
        </>
      );
      break;

    case "admin":
      info_detail = <Text style={Styles.text_detail}>Email: {user.email}</Text>;
      button_user = (
        <>
          <Button
            style={MyStyle.button_user}
            mode="contained"
            onPress={() => navigation.navigate("Admin")}
          >
            Đăng ký tài khoản
          </Button>
        </>
      );
      break;

    default:
      info_detail = null;
      button_user = null;
  }

  return (
    <View style={[MyStyle.container, MyStyle.centerContainer]}>
      <View style={Styles.avatar}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            {selectedImage ? (
              <Avatar.Image size={150} source={{ uri: selectedImage }} />
            ) : (
              user.avatar && (
                <View style={{ borderWidth: 5, borderRadius: 150 }}>
                  <Avatar.Image size={150} source={{ uri: user.avatar }} />
                </View>
              )
            )}
            <Button
              style={Styles.avatar_button}
              mode="contained"
              onPress={picker}
            >
              <Icon name="camera" size={20} color="#000" />
            </Button>
          </>
        )}
      </View>
      <View style={Styles.info}>
        <Text style={Styles.text_name}>
          {user.last_name} {user.first_name}
        </Text>
        <View style={Styles.info_detail}>{info_detail}</View>
      </View>
      <ScrollView style={Styles.log_items}>
        <Button
          style={MyStyle.button_user}
          mode="contained"
          onPress={() =>
            navigation.navigate("UpdateInfo", { token: token, user: user })
          }
        >
          Cập nhật thông tin người dùng
        </Button>
        {button_user}
        <Button
          style={MyStyle.button_user}
          mode="contained"
          onPress={() => logOutFireBaseUser(dispatch)}
        >
          Đăng xuất
        </Button>
      </ScrollView>
    </View>
  );
};

export default Home;
