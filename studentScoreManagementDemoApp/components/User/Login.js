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
import Styles from "../User/Styles";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../configs/Firebase";
import Constants from "expo-constants";
import {
  CLIENT_ID_HOANG,
  CLIENT_SECRET_HOANG,
  CLIENT_ID_HAI,
  CLIENT_SECRET_HAI,
} from "@env";

const Login = ({ route }) => {
  const [user, setUser] = useState({ username: "", password: "" });
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });

  const fields = [
    {
      label: "Tên đăng nhập",
      name: "username",
    },
    {
      label: "Mật khẩu",
      name: "password",
      icon: passwordVisible ? "eye-off" : "eye",
      secureTextEntry: passwordVisible,
    },
  ];

  const [loading, setLoading] = useState(false);
  const nav = useNavigation();
  const dispatch = useContext(MyDispatchContext);

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
        // ...user,
        // client_id: CLIENT_ID_HOANG,
        // client_secret: CLIENT_SECRET_HOANG,
        // grant_type: "password",

        ...user,
        client_id: CLIENT_ID_HAI,
        client_secret: CLIENT_SECRET_HAI,
        grant_type: "password",

        // ...user,
        // client_id: "69KTFKKaC78YxaSoX0ws8yGEgu58ZXNIBiWuDuvI",
        // client_secret: "JHeq6IIvPTBmCBJ3MAmGkcNbMmZQ4PoqctbCLuxGRSQaYFQDs4tHI7bPKqUf3TMKf7U3YUdP9IGlHCDJABRchql6XfBpHkn1R6pcNYMDyEoS54id9IiXXYyx7O9m4GP7",
        // grant_type: "password",

        // ...user,
        // client_id: "3jFUdqJsKwnhj1X5wf5WihTyp2g7mfdWp6V3mhl5",
        // client_secret:
        //   "3FJlILnIxptAwsnoQxSUcltQzwLhV87sEXbVRkrsMlJbM3aZjNy90o6VqNtGwNzK9y09NQBqIlVGn8fi3Cnq7ZnRDXNo8f7NsyQQTyVTfJpzbMEePYsSV97NMXBDZZnt",
        // grant_type: "password",
      });

      await AsyncStorage.setItem("token", res.data.access_token);

      const userRes = await authApi(res.data.access_token).get(
        endpoints["current-user"]
      );

      dispatch({
        type: "login",
        payload: userRes.data,
      });

      if (userRes.data.email && user.password) {
        try {
          await signInWithEmailAndPassword(
            auth,
            userRes.data.email,
            user.password
          );
          console.log("Đăng nhập Firebase thành công");
          // Điều hướng đến trang Home với thông tin người dùng đã được cập nhật
        } catch (err) {
          console.error("Đăng nhập Firebase thất bại: ", err);
          Alert.alert("Đăng Nhập Thất Bại", "Đăng nhập Firebase thất bại");
        }
      } else {
        // Nếu không có email hoặc password, thông báo lỗi và không điều hướng đến trang Home
        Alert.alert("Đăng Nhập Thất Bại", "Sai username hoặc password");
      }
      nav.navigate("Home", {
        token: res.data.access_token,
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
    try {
      const res = await APIs.post(
        endpoints["send-otp"],
        { email: user.username }, // Body
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      Alert.alert(res.data.message);
      nav.navigate("ForgotPassword");
    } catch (ex) {
      console.info(ex);
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
                        icon={c.icon}
                        onPress={() => setPasswordVisible(!passwordVisible)}
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
