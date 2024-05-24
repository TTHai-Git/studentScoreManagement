import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Button, TextInput } from "react-native-paper";
import MyStyle from "../../styles/MyStyle";
import React, { useContext } from "react";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { MyDispatchContext } from "../../configs/Contexts";
import Styles from "../User/Styles";
import { Picker } from "@react-native-picker/picker";

const Login = () => {
<<<<<<< HEAD
  const [user, setUser] = React.useState({});
  const [selectedValue, setSelectedValue] = React.useState("student");
  const fields = [
    {
      label: "Tên đăng nhập",
      name: "username",
    },
    {
      label: "Mật khẩu",
      name: "password",
      secureTextEntry: true,
    },
  ];
  const [loading, setLoading] = React.useState(false);
  const nav = useNavigation();
  const dispatch = useContext(MyDispatchContext);
=======
    const fields = [{
        "label": "Tên đăng nhập",
        "name": "username"
    }, {
        "label": "Mật khẩu",
        "name": "password",
        "secureTextEntry": true
    }];

    const [user, setUser] = React.useState({});
    const [selectedValue, setSelectedValue] = React.useState("student");
    const [loading, setLoading] = React.useState(false);
    const nav = useNavigation();
    const dispatch = useContext(MyDispatchContext);
>>>>>>> 38be495427851edffaf95a10725b2c9caca6457e

  const updateSate = (field, value) => {
    setUser((current) => {
      return { ...current, [field]: value };
    });
  };

  const login = async () => {
    setLoading(true);
    try {
      let res = await APIs.post(endpoints["login"], {
        ...user,
        client_id: "3jFUdqJsKwnhj1X5wf5WihTyp2g7mfdWp6V3mhl5",
        client_secret:
          "3FJlILnIxptAwsnoQxSUcltQzwLhV87sEXbVRkrsMlJbM3aZjNy90o6VqNtGwNzK9y09NQBqIlVGn8fi3Cnq7ZnRDXNo8f7NsyQQTyVTfJpzbMEePYsSV97NMXBDZZnt",
        grant_type: "password",
      });
      console.info(res.data);

      await AsyncStorage.setItem("token", res.data.access_token);

      setTimeout(async () => {
        let user = await authApi(res.data.access_token).get(
          endpoints["current-user"]
        );
        console.info(user.data);

        dispatch({
          type: "login",
          payload: user.data,
        });

        nav.navigate("Home");
      }, 100);
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
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
                  onChangeText={(t) => updateSate(c.name, t)}
                  style={Styles.input}
                  key={c.name}
                  label={c.label}
                />
              </View>
            ))}
=======
    const login = async () => {
        setLoading(true);
        try {
            let res = await APIs.post(endpoints['login'], {
                ...user,
                'client_id': 'uisXGeCrZ5rxJV96OCx6bpk2LOI8dkGqrcHfQupo',
                'client_secret': 'McTliaChLn8aan1owmpkyFhlghBPm37td9yEPxqouiGJFeyjsH19n8LnVixDGByQurlHY2PIxGfrDg5M3WnMFllx58FYRvce6pbf9uAevjFDjLilixqQkdFUwNvlG2RD',
                'grant_type': 'password'
            });
            console.info(res.data);
>>>>>>> 38be495427851edffaf95a10725b2c9caca6457e

            <View
              style={{
                ...Styles.log_items,
                width: "100%",
                position: "relative",
              }}
            >
              <Picker
                style={Styles.input}
                selectedValue={selectedValue}
                onValueChange={(itemValue, itemIndex) =>
                  setSelectedValue(itemValue)
                }
              >
                <Picker.Item label="Sinh viên" value="student" />
                <Picker.Item label="Giáo vụ" value="admin" />
                <Picker.Item label="Giảng viên" value="teacher" />
              </Picker>
            </View>

            <Button mode="contained" onPress={login}>
              {" "}
              Đăng nhập{" "}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

<<<<<<< HEAD
export default Login;
=======
                nav.navigate('Home');
            }, 100);
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }   
    }

    return (
        <View style={MyStyle.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={Styles.log_items}>
                    {fields.map(c => (
                        <View key={c.name} style={{ width: '100%', position: 'relative' }}>
                            <TextInput secureTextEntry={c.secureTextEntry} value={user[c.name]} onChangeText={t => updateSate(c.name, t)} style={Styles.input} key={c.name} label={c.label}/>
                        </View>
                    ))}

                    <View style={{...Styles.log_items, width: '100%', position: 'relative'}}>
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
                    </View>

                    <Button loading={loading} mode="contained" onPress={login}> Đăng nhập </Button>

                </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

export default Login;
>>>>>>> 38be495427851edffaf95a10725b2c9caca6457e
