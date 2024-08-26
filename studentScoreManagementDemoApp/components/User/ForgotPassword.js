import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  View,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { TextInput, HelperText, Button } from "react-native-paper";
import MyStyle from "../../styles/MyStyle";
import Styles from "./Styles";
import APIs, { endpoints } from "../../configs/APIs";

const ForgotPassword = ({ navigation }) => {
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(true);
  const [user, setUser] = useState({
    token: "",
    new_password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const fields = [
    { label: "Token", name: "token" },
    {
      label: "Mật khẩu",
      name: "new_password",
      icon: passwordVisible ? "eye-off" : "eye",
      secureTextEntry: passwordVisible,
    },
    {
      label: "Xác nhận mật khẩu",
      name: "confirm",
      icon: passwordVisible ? "eye-off" : "eye",
      secureTextEntry: confirmPasswordVisible,
    },
  ];

  const updateState = (name, value) => {
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const validateForm = () => {
    let valid = true;
    let newErrors = {};
    if (!user.token) {
      valid = false;
      newErrors.token = "Token không được để trống";
    }
    if (!user.new_password) {
      valid = false;
      newErrors.new_password = "Mật khẩu không được để trống";
    }
    if (user.new_password.length < 6) {
      valid = false;
      newErrors.new_password = "Mật khẩu phải tối thiểu là 6 ký tự";
    }
    if (user.new_password !== user.confirm) {
      valid = false;
      newErrors.confirm = "Mật khẩu xác nhận không khớp";
    }
    setErrors(newErrors);
    return valid;
  };

  const changePassword = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const res = await APIs.patch(
        endpoints["change-password"],
        {
          token: user.token,
          new_password: user.new_password,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      Alert.alert("Success", res.data.message);
      navigation.navigate("Login");
    } catch (error) {
      console.log(error.response);
      if (error.response && error.response.data) {
        Alert.alert("Error", error.response.data.message);
      } else {
        Alert.alert("Error", "An unexpected error occurred.");
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
                    (c.name === "new_password" || c.name === "confirm") && (
                      <TextInput.Icon
                        icon={c.icon}
                        onPress={() =>
                          c.name === "new_password"
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
              style={{ marginTop: 30 }}
              icon="account"
              loading={loading}
              mode="contained"
              onPress={changePassword}
            >
              Cập Nhật
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ForgotPassword;
