import {
  View,
  Text,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Button, HelperText, Icon, TextInput } from "react-native-paper";
import MyStyle from "../../styles/MyStyle";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import APIs, { endpoints } from "../../configs/APIs";
import { useNavigation } from "@react-navigation/native";
import Styles from "../User/Styles";

const Register = () => {
  const [user, setUser] = React.useState({
    role: "student",
    email: "2151050112hai@ou.edu.vn",
  });
  const [err, setErr] = React.useState(false);

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
      icon: "eye",
      name: "password",
      secureTextEntry: true,
    },
    {
      label: "Xác nhận mật khẩu",
      icon: "eye",
      name: "confirm",
      secureTextEntry: true,
    },
  ];
  const nav = useNavigation();
  const [loading, setLoading] = React.useState(false);

  const eyeSecurity = () => {
    sec
  };

  const picker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("iCourseApp", "Permissions Denied!");
    } else {
      let res = await ImagePicker.launchImageLibraryAsync();
      if (!res.canceled) {
        updateState("avatar", res.assets[0].fileName);
      }
    }
  };

  const updateState = (field, value) => {
    setUser((current) => {
      return { ...current, [field]: value };
    });
  };

  const register = async () => {
    if (user.password !== user.confirm) {
      setErr(true);
    } else {
      setErr(false);
      let form = new FormData();
      for (let key in user) {
        if (key !== "confirm") {
          if (key === "avatar" && user.avatar.uri) {
            form.append(key, {
              uri: user.avatar.uri,
              name: user.avatar.uri.split("/").pop(),
              type: "image/jpeg/png",
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

        if (res.status === 201) {
          nav.navigate("Login");
        }
      } catch (ex) {
        console.error(ex);
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
                <TextInput
                  secureTextEntry={ c.secureTextEntry }
                  value={user[c.name]}
                  icon={c.icon}
                  onChangeText={(t) => updateState(c.name, t)}
                  style={MyStyle.input}
                  label={c.label}
                  right={
                    <TextInput.Icon
                      icon={c.icon}
                    />
                  }
                />
              </View>
            ))}

            <HelperText type="error" visible={err}>
              Mật khẩu không khớp!
            </HelperText>

            <Button
              style={{
                ...MyStyle.input,
                height: 40,
                marginTop: -26,
                borderRadius: 5,
              }}
              onPress={picker}
            >
              <Text style={{ color: "#000", fontSize: 15 }}>
                Chọn ảnh đại diện
              </Text>
            </Button>

            {user.avatar && (
              <Image
                source={{ uri: user.avatar.uri }}
                style={Styles.avatar}
                size={50}
              />
            )}

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
