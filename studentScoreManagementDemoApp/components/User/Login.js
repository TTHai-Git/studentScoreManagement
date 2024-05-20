import React, { useContext } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { TextInput, Button } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import Styles from "../User/Styles";
import MyStyle from "../../styles/MyStyle";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import MyContext from "../../configs/MyContext";
import { AsyncStorage } from "react-native";
import { Picker } from "@react-native-picker/picker";

const Login = ({ navigation }) => {
  // const [email, setEmail] = React.useState("");

  const [username, setUserName] = React.useState();
  const [password, setPassword] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [user, dispatch] = useContext(MyContext);

  // const [selectedValue, setSelectedValue] = React.useState("student");

  //Cần hàm xử lý đăng nhập

  const login = async () => {
    setLoading(true);

    try {
      let res = await APIs.post(endpoints["login"], {
        username: username,
        password: password,
        client_id: "3jFUdqJsKwnhj1X5wf5WihTyp2g7mfdWp6V3mhl5",
        client_secret:
          "3FJlILnIxptAwsnoQxSUcltQzwLhV87sEXbVRkrsMlJbM3aZjNy90o6VqNtGwNzK9y09NQBqIlVGn8fi3Cnq7ZnRDXNo8f7NsyQQTyVTfJpzbMEePYsSV97NMXBDZZnt",
        grant_type: "password",
      });

      await AsyncStorage.setItem("access-token", res.data.access_token);
      let user = await authApi(res.data.access_token).get(
        endpoints["current-user"]
      );

      dispatch({
        type: "login",
        payload: user.data,
      });
      navigation.navigate("Home");
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
      console.log(res);
      console.log(user);
    }
  };

  return (
    <View style={MyStyle.container}>
      <View style={Styles.log_items}>
        <TextInput
          style={Styles.input}
          label="Username"
          value={username}
          onChangeText={(username) => setUserName(username)}
        />
      </View>

      {/* <View style={Styles.log_items}>
        <TextInput
          style={Styles.input}
          label="Email"
          value={email}
          onChangeText={(email) => setEmail(email)}
        />
      </View> */}

      <View style={Styles.log_items}>
        <TextInput
          style={Styles.input}
          label="Password"
          value={password}
          onChangeText={(password) => setPassword(password)}
          secureTextEntry={!showPassword}
        />

        <TouchableOpacity
          style={{ position: "absolute", right: 10, top: 15 }}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Icon
            name={showPassword ? "eye-slash" : "eye"}
            size={25}
            color="#000"
          />
        </TouchableOpacity>
      </View>
      {/* <View style={Styles.log_items}>
        {
          <Picker
            style={Styles.input}
            selectedValue={selectedValue}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedValue(itemValue)
            }
          >
            <Picker.Item label="Sinh viên" value="student" />
            <Picker.Item label="Giáo vụ" value="academic_affair" />
            <Picker.Item label="Giảng viên" value="teacher" />
          </Picker>
        }
      </View> */}
      {loading === true ? (
        <ActivityIndicator />
      ) : (
        <>
          <View style={Styles.button}>
            <Button mode="contained" onPress={login}>
              Đăng nhập
            </Button>
          </View>
        </>
      )}
    </View>
  );
};

export default Login;
