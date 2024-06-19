import { useEffect, useState } from "react";
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
import APIs, { endpoints } from "../../configs/APIs";
import { useNavigation } from "@react-navigation/native";
import Styles from "../User/Styles";

import { auth, database } from "../../configs/Firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const Register = () => {
  const [user, setUser] = useState({
    role: "student",
    first_name: "",
    last_name: "",
    email: "@ou.edu.vn",
    username: "",
    password: "1234567890",
    confirm: "1234567890",
    avatar: "",
  });
  const [errors, setErrors] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    password: "",
    confirm: "",
    avatar: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(true);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(true);
  const [imageUploaded, setImageUploaded] = useState(false);

  const fields = [
    { label: "Tên", name: "first_name" },
    { label: "Họ và tên lót", name: "last_name" },
    { label: "Email", name: "email" },
    { label: "Tên đăng nhập", name: "username" },
    {
      label: "Mật khẩu",
      name: "password",
      icon: passwordVisible ? "eye-off" : "eye",
      secureTextEntry: passwordVisible,
    },
    {
      label: "Xác nhận mật khẩu",
      name: "confirm",
      icon: confirmPasswordVisible ? "eye-off" : "eye",
      secureTextEntry: confirmPasswordVisible,
    },
  ];

  const nav = useNavigation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.avatar) {
      Alert.alert("Thành công", "Upload ảnh thành công!");
      setImageUploaded(true);
    }
  }, [user?.avatar]);

  const picker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("iCourseApp", "Permissions Denied!");
      setErrors((prev) => ({ ...prev, avatar: "Permissions Denied!" }));
    } else {
      let res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!res.canceled) {
        updateState("avatar", res.assets[0].uri);
        setErrors((prev) => ({ ...prev, avatar: "" }));
      }
    }
  };

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
      avatar: "",
    };

    if (!user.first_name) newErrors.first_name = "Tên không được để trống";
    if (!user.last_name)
      newErrors.last_name = "Họ và tên lót không được để trống";
    if (!user.email || !user.email.endsWith("@ou.edu.vn"))
      newErrors.email =
        'Sai định dạng email! Vui lòng sử dụng email trường cấp ("example@ou.edu.vn") hoặc không được bỏ trống email';
    if (!user.username)
      newErrors.username = "Tên đăng nhập không được để trống";
    if (!user.password) newErrors.password = "Mật khẩu không được để trống";
    if (user.password !== user.confirm)
      newErrors.confirm = "Mật khẩu không khớp";
    if (!user.avatar) newErrors.avatar = "Vui lòng cập nhật ảnh đại diện";

    setErrors(newErrors);
    valid = Object.values(newErrors).every((error) => error === "");

    return valid;
  };

  const register = async () => {
    if (!validateInputs()) return;

    let form = new FormData();
    for (let key in user) {
      if (key !== "confirm") {
        if (key === "avatar" && user.avatar) {
          form.append(key, {
            uri: user.avatar,
            name: user.avatar.split("/").pop(),
            type: "image/jpeg",
          });
        } else {
          form.append(key, user[key]);
        }
      }
    }

    setLoading(true);
    try {
      let res = await APIs.post(endpoints["register"], form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(res.data);
      if (res.status === 201) {
        // Đăng ký thành công, tiến hành đăng ký với Firebase
        try {
          if (user.email !== "" && user.password !== "") {
            const userCredentital = await createUserWithEmailAndPassword(
              auth,
              user.email,
              user.password
            );
            const userFire = userCredentital.user;

            await setDoc(doc(database, "users", userFire.uid), {
              email: userFire.email,
              uid: userFire.uid,
              avatar: user.avatar,
              name: `${user.last_name} ${user.first_name}`,
            });
          }

          // Hiển thị thông báo thành công và điều hướng sau khi Firebase đăng ký thành công
          Alert.alert("Đăng ký thành công!!!");
          nav.navigate("Login");
        } catch (error) {
          console.error("Đăng ký Firebase thất bại:", error);
          Alert.alert(
            "Đăng ký thành công, nhưng không thể đăng ký với Firebase. Vui lòng thử lại!"
          );
        }
      } else {
        Alert.alert("Đăng ký thất bại!!!");
      }
    } catch (ex) {
      Alert.alert("Có lỗi xảy ra. Vui lòng thử lại!");
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
              style={{
                ...MyStyle.input,
                borderRadius: 5,
              }}
              onPress={picker}
            >
              <Text style={{ color: "#000", fontSize: 15 }}>
                Chọn ảnh đại diện
              </Text>
            </Button>

            {/* {user?.avatar && (
              <Image
                source={{ uri: user.avatar }}
                style={{ width: 100, height: 100 }}
              />
            )}
            <HelperText type="error" visible={!!errors.avatar}>
              {errors.avatar}
            </HelperText> */}

            <Button
              style={{marginTop: 30}}
              icon="account"
              loading={loading}
              mode="contained"
              onPress={register}
            >
              ĐĂNG KÝ
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Register;
