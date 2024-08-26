import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";
import MyStyle from "../../styles/MyStyle";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import { useNavigation } from "@react-navigation/native";
import Styles from "../User/Styles";

import { auth, database } from "../../configs/Firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { MyDispatchContext } from "../../configs/Contexts";
import { logOutFireBaseUser } from "../../configs/Reducers";

const UpdateInfo = ({ navigation, route }) => {
  const dispatch = useContext(MyDispatchContext);
  let token = route.params?.token;
  let user_info = route.params?.user;
  const [user, setUser] = useState({
    first_name: user_info.first_name,
    last_name: user_info.last_name,
    email: user_info.email,
    username: user_info.username,
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    password: "",
    confirm: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(true);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(true);
  const fields = [
    { label: "Tên", name: "first_name" },
    { label: "Họ và tên lót", name: "last_name" },
    { label: "Email", name: "email" },
    { label: "Tên đăng nhập", name: "username" },
    {
      label: "Mật khẩu Mới",
      name: "password",
      icon: passwordVisible ? "eye-off" : "eye",
      secureTextEntry: passwordVisible,
    },
    {
      label: "Xác Nhận Mật Khẩu Mới",
      name: "confirm",
      icon: confirmPasswordVisible ? "eye-off" : "eye",
      secureTextEntry: confirmPasswordVisible,
    },
  ];

  const nav = useNavigation();
  const [loading, setLoading] = useState(false);

  const updateState = (field, value) => {
    setUser((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validateInputs = () => {
    let valid = true;

    let newErrors = {
      first_name: "",
      last_name: "",
      email: "",
      username: "",
      password: "",
      confirm: "",
    };

    if (!user.first_name) newErrors.first_name = "Tên không được để trống";
    if (!user.last_name)
      newErrors.last_name = "Họ và tên lót không được để trống";
    if (!user.email || !user.email.endsWith("@ou.edu.vn"))
      newErrors.email =
        'Sai định dạng email! Vui lòng sử dụng email trường cấp ("example@ou.edu.vn") hoặc không được bỏ trống email';
    if (!user.username)
      newErrors.username = "Tên đăng nhập không được để trống";
    if (user.password !== "") {
      if (user.password.length < 6)
        newErrors.password = "Mật khẩu phải có đủ 6 ký tự";
    }
    if (user.password !== user.confirm)
      newErrors.confirm = "Mật khẩu không khớp";

    setErrors(newErrors);

    return valid;
  };

  const updateInfo = async () => {
    if (!validateInputs()) return;

    let form = new FormData();
    for (let key in user) {
      if (key !== "confirm") {
        if (user.password !== "") {
          form.append(key, user[key]);
        } else {
          if (key !== "password") {
            form.append(key, user[key]);
          }
        }
      }
    }

    setLoading(true);
    try {
      let res = await authApi(token).patch(endpoints["current-user"], form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(res.data.message);
      Alert.alert(res.data.message);
      logOutFireBaseUser(dispatch);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        Alert.alert("Error", error.response.data.message);
      } else {
        console.log("Unexpected error: ", error);
        Alert.alert("Error", "Failed to register study.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[MyStyle.container]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View style={Styles.log_items}>
            {fields.map((c) => (
              <View
                key={c.name}
                style={{ width: "100%", position: "relative" }}
              >
                <TextInput
                  secureTextEntry={c.secureTextEntry}
                  value={user[c.name]}
                  onChangeText={(t) => updateState(c.name, t)}
                  style={[
                    MyStyle.input,
                    errors[c.name] ? { borderColor: "red" } : {},
                  ]}
                  label={c.label}
                  right={
                    (c.name === "password" || c.name === "confirm") && (
                      <TextInput.Icon
                        icon={c.icon}
                        onPress={() =>
                          c.name === "password"
                            ? setPasswordVisible(!passwordVisible)
                            : setConfirmPasswordVisible(!confirmPasswordVisible)
                        }
                      />
                    )
                  }
                />
                <HelperText type="error" visible={!!errors[c.name]}>
                  {errors[c.name]}
                </HelperText>
              </View>
            ))}

            <Button
              style={{ marginTop: 5 }}
              icon="account"
              loading={loading}
              mode="contained"
              onPress={updateInfo}
            >
              Cập Nhật
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default UpdateInfo;
