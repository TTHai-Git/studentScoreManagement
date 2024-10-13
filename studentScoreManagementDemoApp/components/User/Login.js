import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";
import React, { useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { MyDispatchContext } from "../../configs/Contexts";
import { signInWithEmailAndPassword } from "firebase/auth";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import { auth } from "../../configs/Firebase";
import MyStyle from "../../styles/MyStyle";
import Styles from "../User/Styles";
import { CLIENT_ID_HAI, CLIENT_SECRET_HAI } from "@env";
import Icon from "react-native-vector-icons/FontAwesome";

const Login = () => {
  const [user, setUser] = useState({
    username: "Demo",
    password: "1234567890",
  });
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [errors, setErrors] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState({ login: false, otp: false });

  const nav = useNavigation();
  const dispatch = useContext(MyDispatchContext);

  const updateState = (field, value) => {
    setUser((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateInputs = () => {
    let newErrors = { username: "", password: "" };
    let isValid = true;

    if (!user.username) {
      newErrors.username = "Username không được để trống";
      isValid = false;
    }
    if (!user.password) {
      newErrors.password = "Password không được để trống";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    setLoading((prev) => ({ ...prev, login: true }));

    try {
      const res = await APIs.post(endpoints["login"], {
        ...user,
        client_id: CLIENT_ID_HAI,
        client_secret: CLIENT_SECRET_HAI,
        grant_type: "password",
      });

      const accessToken = res.data.access_token;
      await AsyncStorage.setItem("token", accessToken);

      const userRes = await authApi(accessToken).get(endpoints["current-user"]);
      const userData = { ...userRes.data, access_token: accessToken };

      dispatch({ type: "login", payload: userData });

      await loginToFirebase(userData.email, user.password);

      nav.navigate("Home", { user: userData });
    } catch (error) {
      console.error("API Login Error: ", error);
      Alert.alert("Đăng Nhập Thất Bại", "Sai username hoặc password");
    } finally {
      setLoading((prev) => ({ ...prev, login: false }));
    }
  };

  const loginToFirebase = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Đăng nhập Firebase thành công");
    } catch (error) {
      console.error("Firebase Login Error: ", error);
      Alert.alert("Đăng Nhập Thất Bại", "Đăng nhập Firebase thất bại");
    }
  };

  const sendOtp = async () => {
    if (!user.username) {
      setErrors((prev) => ({
        ...prev,
        username: "Username không được để trống",
      }));
      return;
    }

    setLoading((prev) => ({ ...prev, otp: true }));

    try {
      const res = await APIs.post(
        endpoints["send-otp"],
        { username: user.username },
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      Alert.alert("Success", res.data.message);
      nav.navigate("ForgotPassword");
    } catch (error) {
      console.error("OTP Error: ", error.response || error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "An unexpected error occurred."
      );
    } finally {
      setLoading((prev) => ({ ...prev, otp: false }));
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
            {["username", "password"].map((name) => (
              <View key={name} style={{ width: "100%", position: "relative" }}>
                <TextInput
                  label={name === "username" ? "Tên đăng nhập" : "Mật khẩu"}
                  secureTextEntry={name === "password" && passwordVisible}
                  value={user[name]}
                  onChangeText={(text) => updateState(name, text)}
                  style={[
                    MyStyle.input,
                    errors[name] ? { borderColor: "red" } : {},
                  ]}
                  right={
                    name === "password" && (
                      <TextInput.Icon
                        icon={() => (
                          <Icon
                            name={passwordVisible ? "eye-slash" : "eye"}
                            size={20}
                          />
                        )}
                        onPress={() => setPasswordVisible(!passwordVisible)}
                      />
                    )
                  }
                />
                <HelperText type="error" visible={!!errors[name]}>
                  {errors[name]}
                </HelperText>
              </View>
            ))}
            <Button
              icon="account"
              mode="contained"
              onPress={handleLogin}
              loading={loading.login}
              disabled={loading.login || loading.otp}
            >
              ĐĂNG NHẬP
            </Button>
            <Button
              icon="key"
              mode="contained"
              onPress={sendOtp}
              style={{ marginTop: 30 }}
              loading={loading.otp}
              disabled={loading.login || loading.otp}
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
