import React, { useContext, useState } from "react";
import { View, Text, Alert, Image } from "react-native";
import { Button, Avatar } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
import MyStyle from "../../styles/MyStyle";
import { MyDispatchContext, MyUserContext } from "../../configs/Contexts";
import Styles from "./Styles";
import { authApi, endpoints } from "../../configs/APIs";
import { logOutFireBaseUser } from "../../configs/Reducers";

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
      formData.append("id", user.id);
      formData.append("avatar", {
        uri: selectedAsset.uri,
        name: "userProfile.jpg",
        type: "image/jpeg",
      });

      try {
        setLoading(true);
        const url = endpoints["upload-avatar"](user.id);
        const res = await authApi(token).patch(url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (res.status === 200) {
          Alert.alert(res.data.message);
          updateState("avatar", selectedAsset.uri);
        } else {
          Alert.alert("Upload Avatar thất bại!!!");
        }
      } catch (ex) {
        console.error(ex);
        Alert.alert("Có lỗi xảy ra. Vui lòng thử lại!");
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
        <Button
          style={MyStyle.button_user}
          mode="contained"
          onPress={() =>
            navigation.navigate("StudyClassRooms", { token: token, user: user })
          }
        >
          Xem danh sách lớp học
        </Button>
      );
      break;

    // case "admin":
    //   info_detail = <Text style={Styles.text_detail}>Email: {user.email}</Text>;
    //   button_user = (
    //     <Button
    //       style={MyStyle.button_user}
    //       mode="contained"
    //       onPress={() => navigation.navigate("Admin")}
    //     >
    //       Đăng ký tài khoản
    //     </Button>
    //   );
    //   break;

    default:
      info_detail = null;
      button_user = null;
  }

  return (
    <View style={[MyStyle.container, MyStyle.centerContainer]}>
      <View style={Styles.avatar}>
        {selectedImage === null ? (
          <>
            {user.avatar && (
              <Avatar.Image size={250} source={{ uri: user.avatar }} />
            )}
          </>
        ) : (
          <>
            <Avatar.Image size={250} source={{ uri: selectedImage }} />
          </>
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
          onPress={() => logOutFireBaseUser(dispatch)}
        >
          Đăng xuất
        </Button>
      </View>
    </View>
  );
};

export default Home;
