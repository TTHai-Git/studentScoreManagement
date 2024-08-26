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
import APIs, { endpoints } from "../../configs/APIs";
import { useNavigation } from "@react-navigation/native";
import { auth, database } from "../../configs/Firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const Register = () => {
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
    role: "student",
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
      if (!res.canceled && res.assets.length > 0) {
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
      let res = await APIs.post(endpoints["student-register"], form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.status === 201) {
        // Successful registration, proceed with Firebase registration
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

          // Display success message and navigate after Firebase registration
          Alert.alert("Registration successful!");
          nav.navigate("Login");
        } catch (error) {
          console.error("Firebase registration failed:", error);
          Alert.alert(
            "Registration successful, but failed to register with Firebase. Please try again!"
          );
        }
      } else {
        Alert.alert("Registration failed!");
      }
    } catch (ex) {
      Alert.alert("An error occurred. Please try again!");
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

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
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
});

export default Register;
