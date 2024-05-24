import { View, Text, Alert, Image, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { Button, HelperText, Icon, TextInput, TouchableRipple } from "react-native-paper";
import MyStyle from "../../styles/MyStyle";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import APIs, { endpoints } from "../../configs/APIs";
import { useNavigation } from "@react-navigation/native";
import Styles from "../User/Styles";
import { launchImageLibrary } from "react-native-image-picker";

const Register = () => {
  const [user, setUser] = React.useState({});
  const [err, setErr] = React.useState(false);

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

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

  const picker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") Alert.alert("iCourseApp", "Permissions Denied!");
    else {
      let res = await ImagePicker.launchImageLibraryAsync();
      if (!res.canceled) {
        updateSate("avatar", res.assets[0]);
      }
    }
  };

  const updateSate = (field, value) => {
    setUser((current) => {
      return { ...current, [field]: value };
    });
  };

  const register = async () => {
    if (user["password"] !== user["confirm"]) setErr(true);
    else {
      setErr(false);
      let form = new FormData();
      for (let key in user)
        if (key !== "confirm")
          if (key === "avatar") {
            form.append(key, {
              uri: user.avatar.uri,
              name: user.avatar.fileName,
              type: user.avatar.type,
            });
          } else form.append(key, user[key]);

      console.info(form);
      setLoading(true);
      try {
        let res = await APIs.post(endpoints["register"], form, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (res.status === 201) nav.navigate("Login");
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
                  secureTextEntry={c.secureTextEntry}
                  value={user[c.name]}
                  onChangeText={(t) => updateSate(c.name, t)}
                  style={Styles.input}
                  label={c.label}
                />
                {/* {(c.name === "password" || c.name === "confirm") && (
                  <TouchableOpacity
                    style={{ position: "absolute", right: 10, top: 30 }} // Adjust top as necessary
                    onPress={() => {
                      if (c.name === "password") {
                        setShowPassword(!showPassword);
                      } else if (c.name === "confirm") {
                        setShowConfirmPassword(!showConfirmPassword);
                      }
                    }}
                  >
                    <Icon
                      name={
                        (
                          c.name === "password"
                            ? showPassword
                            : showConfirmPassword
                        )
                          ? "eye-slash"
                          : "eye"
                      }
                      size={25}
                      color="#000"
                    />
                  </TouchableOpacity>
                )} */}
              </View>
            ))}

            <HelperText type="error" visible={err}>
              Mật khẩu không khớp!
            </HelperText>

            <Button
              style={{
                ...Styles.input,
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

            {/* {user.avatar && (
              <Image source={{ uri: user.avatar.uri }} style={Styles.avatar} />
            )} */}

            <Button icon="account" loading={loading} mode="contained" onPress={register} > ĐĂNG KÝ </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Register;
