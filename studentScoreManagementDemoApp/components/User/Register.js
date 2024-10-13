import { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Animated,
} from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import { useNavigation } from "@react-navigation/native";
import { auth, database } from "../../configs/Firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "react-native-vector-icons/AntDesign";

const Register = ({ route }) => {
  const token = route.params?.token;
  const loadRoles = async () => {
    try {
      setLoading(true);
      const url = `${endpoints["roles"]}`;
      const res = await authApi(token).get(url);
      // console.log(res.data.results);
      const arr = res.data.results.map((item) => ({
        label: item.name,
        value: item.name,
      }));
      setData(arr);
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

  const generateRandomNumber = () => {
    const currentYear = new Date().getFullYear();
    const prefix = currentYear.toString().slice(-2);
    const randomNumber = Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, "0");
    return prefix + randomNumber;
  };
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [user, setUser] = useState({
    role: "",
    first_name: "",
    last_name: "",
    email: "...@ou.edu.vn",
    username: "",
    password: "1234567890",
    confirm: "1234567890",
    avatar: "",
    code: generateRandomNumber(),
  });
  const [errors, setErrors] = useState({});
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(true);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigation();
  const [value, setValue] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    if (user?.avatar) {
      Alert.alert("Success", "Image uploaded successfully!");
      setImageUploaded(true);
    }
  }, [user?.avatar]);

  useEffect(() => {
    loadRoles();
  }, []);

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
      if (!res.canceled && res.assets && res.assets.length > 0) {
        updateState("avatar", res.assets[0].uri);
        setErrors((prev) => ({ ...prev, avatar: "" }));
      } else {
        Alert.alert("Error", "No image selected");
      }
    }
  };

  const updateState = (field, value) => {
    setUser((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validateInputs = () => {
    let valid = true;
    let newErrors = {};

    if (!user.first_name) newErrors.first_name = "First name cannot be empty";
    if (!user.last_name) newErrors.last_name = "Last name cannot be empty";
    if (!user.email || !user.email.endsWith("@ou.edu.vn")) {
      newErrors.email =
        'Invalid email format! Please use an OU email ("example@ou.edu.vn") or do not leave it empty';
    }
    if (!user.username) newErrors.username = "Username cannot be empty";
    if (!user.password || user.password.length < 6)
      newErrors.password =
        "Password cannot be empty or must be at least 6 characters long";
    if (user.password !== user.confirm)
      newErrors.confirm = "Passwords do not match";
    if (!user.avatar) newErrors.avatar = "Please upload a profile picture";
    if (!user.role) newErrors.role = "Vui lòng chọn phân quyền người dùng";

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
    let res;
    try {
      const endpoint =
        user.role === "teacher"
          ? endpoints["register_teacher"]
          : user.role === "student"
          ? endpoints["register_student"]
          : endpoints["register"];

      res = await APIs.post(endpoint, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 201) {
        try {
          if (user.email !== "" && user.password !== "") {
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              user.email,
              user.password
            );
            const userFire = userCredential.user;

            await setDoc(doc(database, "users", userFire.uid), {
              email: userFire.email,
              uid: userFire.uid,
              avatar: user.avatar,
              name: `${user.last_name} ${user.first_name}`,
              role: user.role,
            });
          }

          Alert.alert("Success", "Cấp tài khoản Firebase để chat thành công");
        } catch (error) {
          console.error("Firebase registration error:", error.message || error);
          Alert.alert(
            "Warning",
            "Cấp tài khoản cho người dùng thành công nhưng Đăng ký tài khoản chat Firebase thất bại"
          );
        }
      } else {
        Alert.alert("Error", "Cấp tài khoản cho người dùng thất bại");
      }
    } catch (ex) {
      console.error("API registration error:", ex.message || ex);
      Alert.alert("Error", "An error occurred. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "First Name", name: "first_name" },
    { label: "Last Name", name: "last_name" },
    { label: "Email", name: "email" },
    { label: "Username", name: "username" },
    {
      label: "Password",
      name: "password",
      icon: passwordVisible ? "eye-off" : "eye",
      secureTextEntry: passwordVisible,
    },
    {
      label: "Confirm Password",
      name: "confirm",
      icon: confirmPasswordVisible ? "eye-off" : "eye",
      secureTextEntry: confirmPasswordVisible,
    },
  ];

  const renderItem = (item) => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{item.label}</Text>
        {item.value === value && (
          <AntDesign
            style={styles.icon}
            color="black"
            name="Safety"
            size={20}
          />
        )}
      </View>
    );
  };

  const handleItemChange = (item) => {
    setUser((current) => ({ ...current, role: item.value }));
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View style={styles.formContainer}>
            {fields.map((field) => (
              <View
                key={field.name}
                style={{ width: "100%", position: "relative" }}
              >
                <TextInput
                  secureTextEntry={field.secureTextEntry}
                  value={user[field.name]}
                  onChangeText={(text) => updateState(field.name, text)}
                  style={[
                    styles.input,
                    errors[field.name] ? { borderColor: "#f44336" } : {},
                  ]}
                  label={field.label}
                  right={
                    (field.name === "password" || field.name === "confirm") && (
                      <TextInput.Icon
                        icon={field.icon}
                        onPress={() =>
                          field.name === "password"
                            ? setPasswordVisible(!passwordVisible)
                            : setConfirmPasswordVisible(!confirmPasswordVisible)
                        }
                      />
                    )
                  }
                />
                <HelperText type="error" visible={!!errors[field.name]}>
                  {errors[field.name]}
                </HelperText>
              </View>
            ))}
            <Button
              style={styles.imagePickerButton}
              mode="outlined"
              onPress={picker}
            >
              <Text style={styles.imagePickerText}>Select Profile Picture</Text>
            </Button>

            <HelperText type="error" visible={!!errors.avatar}>
              {errors.avatar}
            </HelperText>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={data}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={"Chọn phân quyền tài khoản..."}
              searchPlaceholder="Search..."
              value={value}
              onChange={(item) => {
                handleItemChange(item);
              }}
              renderLeftIcon={() => (
                <AntDesign
                  style={styles.icon}
                  color="black"
                  name="Safety"
                  size={20}
                />
              )}
              renderItem={renderItem}
            />
            <Button
              style={styles.submitButton}
              icon="account"
              loading={loading}
              mode="contained"
              onPress={register}
            >
              Register
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#e3f2fd", // Light blue background
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#90caf9", // Light blue border
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bbdefb", // Light blue border
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  imagePickerButton: {
    marginVertical: 15,
    borderRadius: 10,
    borderColor: "#1e88e5", // Blue border
    borderWidth: 1,
  },
  imagePickerText: {
    color: "#1e88e5", // Blue text
    fontSize: 16,
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 10,
  },
  dropdown: {
    margin: 16,
    height: 50,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  icon: {
    marginRight: 5,
  },
  item: {
    padding: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textItem: {
    flex: 1,
    fontSize: 16,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

export default Register;
