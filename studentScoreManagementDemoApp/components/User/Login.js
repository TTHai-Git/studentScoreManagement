import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";
import MyStyle from "../../styles/MyStyle";
import React, { useContext, useState } from "react";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { MyDispatchContext } from "../../configs/Contexts";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../configs/Firebase";
import Styles from "../User/Styles";
import { CLIENT_ID_HAI, CLIENT_SECRET_HAI } from "@env";
import Icon from "react-native-vector-icons/FontAwesome";

const Login = () => {
  const [user, setUser] = useState({
    username: "DHThanh",
    password: "1234567890",
  });
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const nav = useNavigation();
  const dispatch = useContext(MyDispatchContext);

  const fields = [
    {
      label: "Tên đăng nhập",
      name: "username",
    },
    {
      label: "Mật khẩu",
      name: "password",
      icon: passwordVisible ? "eye-slash" : "eye",
      secureTextEntry: passwordVisible,
    },
  ];

  const updateState = (field, value) => {
    setUser((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validateInputs = () => {
    let valid = true;
    let newErrors = { username: "", password: "" };

    if (!user.username) {
      newErrors.username = "Username không được để trống";
      valid = false;
    }

    if (!user.password) {
      newErrors.password = "Password không được để trống";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const login = async () => {
    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    try {
      const res = await APIs.post(endpoints["login"], {
        ...user,
        client_id: CLIENT_ID_HAI,
        client_secret: CLIENT_SECRET_HAI,
        grant_type: "password",
      });

      await AsyncStorage.setItem("token", res.data.access_token);

      const userRes = await authApi(res.data.access_token).get(
        endpoints["current-user"]
      );

      userRes.data.access_token = res.data.access_token;
      dispatch({
        type: "login",
        payload: userRes.data,
      });

      nav.navigate("Home", {
        // token: res.data.access_token,
        user: userRes.data,
      });
    } catch (ex) {
      console.error("Đăng nhập API thất bại: ", ex);
      Alert.alert("Đăng Nhập Thất Bại", "Sai username hoặc password");
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    if (!user.username) {
      setErrors((current) => ({
        ...current,
        username: "Username không được để trống",
      }));
      return;
    }

    try {
      const res = await APIs.post(
        endpoints["send-otp"],
        { username: user.username },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      Alert.alert("Success", res.data.message);
      nav.navigate("ForgotPassword");
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
    <View style={MyStyle.container}>
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
                    c.name === "password" && (
                      <TextInput.Icon
                        icon={() => (
                          <Icon
                            name={c.icon}
                            size={20}
                            onPress={() => setPasswordVisible(!passwordVisible)}
                          />
                        )}
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
              icon="account"
              mode="contained"
              onPress={login}
              loading={loading}
            >
              ĐĂNG NHẬP
            </Button>
            <Button
              icon="key"
              mode="contained"
              onPress={sendOtp}
              style={{ marginTop: 30 }}
            >
              Quên Mật Khẩu
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Login;
