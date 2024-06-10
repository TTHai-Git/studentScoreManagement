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

const Register = () => {
  const [user, setUser] = React.useState({
    role: "student",
    // email: "2151050112hai@ou.edu.vn",
  });
  const [errors, setErrors] = React.useState({
    password: false,
    avatar: false,
    email: false,
  });

  const [passwordVisible, setPasswordVisible] = React.useState(true);
  const [confirmPasswordVisible, setConfirmPasswordVisible] =
    React.useState(true);

  const fields = [
    {
      label: "Tên",
      name: "first_name",
    },
    {
      label: "Họ và tên lót",
      name: "last_name",
    },
    {
      label: "Email",
      name: "email",
    },
    {
      label: "Tên đăng nhập",
      name: "username",
    },
    {
      label: "Mật khẩu",
      icon: passwordVisible ? "eye-off" : "eye",
      name: "password",
      secureTextEntry: passwordVisible,
    },
    {
      label: "Xác nhận mật khẩu",
      icon: confirmPasswordVisible ? "eye-off" : "eye",
      name: "confirm",
      secureTextEntry: confirmPasswordVisible,
    },
  ];

  const nav = useNavigation();
  const [loading, setLoading] = React.useState(false);

  const picker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("iCourseApp", "Permissions Denied!");
      setErrors((prev) => ({ ...prev, avatar: true }));
    } else {
      let res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!res.canceled) {
        updateState("avatar", res.assets[0].uri);
        setErrors((prev) => ({ ...prev, avatar: false }));
      }
    }
  };

  const updateState = (field, value) => {
    setUser((current) => {
      return { ...current, [field]: value };
    });
  };

  const register = async () => {
    let hasError = false;
    let errorState = {
      password: false,
      avatar: false,
      email: false,
    };

    if (!user.avatar) {
      errorState.avatar = true;
      hasError = true;
    }

    if (!user.email || !user.email.endsWith("@ou.edu.vn")) {
      errorState.email = true;
      hasError = true;
    }

    if (user.password !== user.confirm) {
      errorState.password = true;
      hasError = true;
    }

    setErrors(errorState);

    if (!hasError) {
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
      console.log(user);
      setLoading(true);
      try {
        let res = await APIs.post(endpoints["register"], form, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (res.status === 201) {
          Alert.alert("Đăng Ký Thành Công!!!");
          nav.navigate("Login");
        } else {
          Alert.alert("Đăng Ký Thất Bại!!!");
        }
      } catch (ex) {
        console.error(ex);
        Alert.alert("Có lỗi xảy ra. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
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
                {c.name === "email" ? (
                  <>
                    <TextInput
                      secureTextEntry={c.secureTextEntry}
                      value={user[c.name]}
                      onChangeText={(t) => updateState(c.name, t)}
                      style={MyStyle.input}
                      label={c.label}
                      right={
                        (c.name === "password" || c.name === "confirm") && (
                          <TextInput.Icon
                            icon={c.icon}
                            onPress={() =>
                              c.name === "password"
                                ? setPasswordVisible(!passwordVisible)
                                : setConfirmPasswordVisible(
                                    !confirmPasswordVisible
                                  )
                            }
                          />
                        )
                      }
                    />
                    <HelperText type="error" visible={errors.email}>
                      Sai định dạng email! Vui lòng sử dụng email trường cấp
                      ("example@ou.edu.vn") hoặc không được bỏ trống email !!!
                    </HelperText>
                  </>
                ) : (
                  <>
                    <TextInput
                      secureTextEntry={c.secureTextEntry}
                      value={user[c.name]}
                      onChangeText={(t) => updateState(c.name, t)}
                      style={MyStyle.input}
                      label={c.label}
                      right={
                        (c.name === "password" || c.name === "confirm") && (
                          <TextInput.Icon
                            icon={c.icon}
                            onPress={() =>
                              c.name === "password"
                                ? setPasswordVisible(!passwordVisible)
                                : setConfirmPasswordVisible(
                                    !confirmPasswordVisible
                                  )
                            }
                          />
                        )
                      }
                    />
                  </>
                )}
              </View>
            ))}
            <HelperText type="error" visible={errors.password}>
              Mật khẩu không khớp hoặc không được bỏ trống mật khẩu!!!
            </HelperText>

            <Button
              style={{
                ...MyStyle.input,
                height: 40,
                marginTop: 26,
                borderRadius: 5,
              }}
              onPress={picker}
            >
              <Text style={{ color: "#000", fontSize: 15 }}>
                Chọn ảnh đại diện
              </Text>
            </Button>

            {user?.avatar && (
              <Image source={{ uri: user.avatar }} style={Styles.avatar} />
            )}
            <HelperText type="error" visible={errors.avatar}>
              Vui lòng cập nhật ảnh đại diện!!!
            </HelperText>

            <Button
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
