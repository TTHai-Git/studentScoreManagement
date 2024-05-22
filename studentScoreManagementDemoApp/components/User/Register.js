import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  PermissionsAndroid,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { Button, TextInput } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import Styles from "../User/Styles";
import MyStyle from "../../styles/MyStyle";
import APIs, { endpoints } from "../../configs/APIs";

const Register = ({ navigation }) => {
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    username: "",
    password: "",
    email: "",
    avatar:
      "https://i2.wp.com/genshinbuilds.aipurrjects.com/genshin/characters/yae_miko/image.png?strip=all&quality=75&w=256",
  });
  const [confirm_password, setConfirm_Password] = React.useState("");

  const [showPassword, setShowPassword] = React.useState(false);

  const [loading, setLoading] = useState(false);

  //Cần hàm xử lý đăng ký

  const register = async () => {
    setLoading(true);

    const form = new FormData();
    for (let key in user)
      if (key === "avatar") {
        form.append(key, {
          uri: user[key].uri,
          name: user[key].fileName,
          type: user[key].type,
        });
      } else form.append(key, user[key]);

    try {
      setLoading(true);
      let res = await APIs.post(endpoints["register"], form, {
        headers: { "Content-Type": "multipart/form-data" },
        data: form,
      });
      console.info(res.data);
      navigation.navigate("Login");
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
      console.log(user);
    }
  };

  const picker = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Camera permission given");
        const result = await launchImageLibrary({
          mediaType: "photo",
          cameraType: "front",
        });
        change("avatar", result.assets[0].uri);
      } else {
        console.log("Camera permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const change = (field, value) => {
    setUser((current) => {
      return { ...current, [field]: value };
    });
  };

  return (
    <ScrollView>
      <View style={MyStyle.container}>
        <View style={Styles.log_items}>
          <TextInput
            style={Styles.input}
            label="First_Name"
            value={user.first_name}
            onChangeText={(first_name) => change("first_name", first_name)}
          />
        </View>

        <View style={Styles.log_items}>
          <TextInput
            style={Styles.input}
            label="Last_Name"
            value={user.last_name}
            onChangeText={(last_name) => change("last_name", last_name)}
          />
        </View>

        <View style={Styles.log_items}>
          <TextInput
            style={Styles.input}
            label="UserName"
            value={user.username}
            onChangeText={(username) => change("username", username)}
          />
        </View>

        <View style={Styles.log_items}>
          <TextInput
            style={Styles.input}
            label="Mật khẩu"
            value={user.password}
            onChangeText={(password) => change("password", password)}
            secureTextEntry={!showPassword}
          />

          <TouchableOpacity
            style={{ position: "absolute", right: 10, top: 15 }}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Icon
              name={showPassword ? "eye-slash" : "eye"}
              size={25}
              color="#000"
            />
          </TouchableOpacity>
        </View>

        <View style={Styles.log_items}>
          <TextInput
            style={Styles.input}
            label="Xác nhận lại mật khẩu"
            value={confirm_password}
            onChangeText={(confirm_password) =>
              setConfirm_Password(confirm_password)
            }
            secureTextEntry={!showPassword}
          />

          <TouchableOpacity
            style={{ position: "absolute", right: 10, top: 15 }}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Icon
              name={showPassword ? "eye-slash" : "eye"}
              size={25}
              color="#000"
            />
          </TouchableOpacity>
        </View>

        <View style={Styles.log_items}>
          <TextInput
            style={Styles.input}
            label="Email"
            value={user.email}
            onChangeText={(email) => change("email", email)}
          />
        </View>

        <View style={Styles.log_items}>
          <TouchableOpacity style={Styles.input} onPress={picker}>
            <Text>Chọn ảnh đại diện...</Text>
          </TouchableOpacity>
          {user.avatar ? (
            <Image style={Styles.avatar} source={{ uri: user.avatar.uri }} />
          ) : (
            ""
          )}
          {loading === true ? (
            <ActivityIndicator />
          ) : (
            <>
              <Button
                style={Styles.button_user}
                mode="contained"
                onPress={register}
              >
                Đăng Ký
              </Button>
            </>
          )}
        </View>

        {/* <View style={Styles.button}>
        <Button mode="contained" onPress={() => console.log("Register")}>
          {" "}
          Đăng ký{" "}
        </Button>
      </View> */}
      </View>
    </ScrollView>
  );
};

export default Register;
