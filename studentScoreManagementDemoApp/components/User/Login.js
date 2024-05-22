// import React, { useContext } from "react";
// import { View, TouchableOpacity, ActivityIndicator } from "react-native";
// import { TextInput, Button } from "react-native-paper";
// import Icon from "react-native-vector-icons/FontAwesome";
// import Styles from "../User/Styles";
// import MyStyle from "../../styles/MyStyle";
// import APIs, { authApi, endpoints } from "../../configs/APIs";
// import { AsyncStorage } from "react-native";
// import { Picker } from "@react-native-picker/picker";
// import Contexts from "../../configs/Contexts";

// const Login = ({ navigation }) => {
//   // const [email, setEmail] = React.useState("");

//   const [username, setUserName] = React.useState("");
//   const [password, setPassword] = React.useState("");
//   const [loading, setLoading] = React.useState(false);
//   const [showPassword, setShowPassword] = React.useState(false);
//   const [user, dispatch] = useContext(Contexts);

//   const [selectedValue, setSelectedValue] = React.useState("student");

//   const login = async () => {
//     setLoading(true);

//     try {
//         let res = await APIs.post(endpoints["login"], {
//             username: username,
//             password: password,
//             client_id: "Xx3MdHxmJSC3nLTtp7s9jlImYDBOv8fX8blZchbs",
//             client_secret:
//             "24j2gRnkO4CI811To1JxWDlhavmfjm2x1K4wKSOisGUBi1wuMRfJbZkE8JNVgurMoMXTUfMab4ZLevDhwqKJ0QNLnwrQYlkUws4MRdANr9DNxEopzqmNeA0pWzkx5jpM",
//             grant_type: "password"
//         });

//         await AsyncStorage.setItem("access-token", res.data.access_token);
//         let user = await authApi(res.data.access_token).get(
//             endpoints["current-user"]
//       );

//       dispatch({
//         type: "login",
//         payload: user.data,
//       });
//       navigation.navigate("Home");
//     } catch (ex) {
//         console.error(ex);
//     } finally {
//         setLoading(false);
//         console.log(res);
//         console.log(user);
//     }
//   };

//   return (
//     <View style={[MyStyle.container, MyStyle.centerContainer]}>
//         {/* <View style={Styles.log_items}>
//                 <TextInput
//                     style={Styles.input}
//                     label="Email"
//                     value={email}
//                     onChangeText={(email) => setEmail(email)}
//                 />
//         </View> */}

//         <View style={Styles.log_items}>
//             <TextInput
//             style={Styles.input}
//             label="Username"
//             value={username}
//             onChangeText={(username) => setUserName(username)}
//             />
//         </View>

//         <View style={Styles.log_items}>
//             <TextInput
//             style={Styles.input}
//             label="Password"
//             value={password}
//             onChangeText={(password) => setPassword(password)}
//             secureTextEntry={!showPassword}
//             />

//             <TouchableOpacity
//                 style={{ position: "absolute", right: 10, top: 15 }}
//                 onPress={() => setShowPassword(!showPassword)}
//             >
//                 <Icon
//                     name={showPassword ? "eye-slash" : "eye"}
//                     size={25}
//                     color="#000"
//                 />
//             </TouchableOpacity>
//       </View>

//       <View style={Styles.log_items}>
//         {
//           <Picker
//             style={Styles.input}
//             selectedValue={selectedValue}
//             onValueChange={(itemValue, itemIndex) =>
//               setSelectedValue(itemValue)
//             }
//           >
//             <Picker.Item label="Sinh viên" value="student" />
//             <Picker.Item label="Giáo vụ" value="academic_affair" />
//             <Picker.Item label="Giảng viên" value="teacher" />
//           </Picker>
//         }
//       </View>

//       {/* <View style={Styles.button}>
//             <Button mode="contained" onPress={() => console.log('Login')}> Đăng nhập </Button>
//             <Button mode="contained" onPress={() => console.log('Register')}> Đăng ký </Button>
//       </View> */}

//       {loading === true ? <ActivityIndicator />:<>
//           <View style={Styles.button}>
//                 <Button mode="contained" onPress={login}>Đăng nhập</Button>
//           </View>
//       </>}
//     </View>
//   );
// };

// export default Login;

import { View, Text } from "react-native";
import { Button, TextInput } from "react-native-paper";
import MyStyle from "../../styles/MyStyle";
import React, { useContext } from "react";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { MyDispatchContext } from "../../configs/Contexts";

const Login = () => {
    const [user, setUser] = React.useState({});
    const fields = [{
        "label": "Tên đăng nhập",
        "icon": "account",
        "name": "username"
    }, {
        "label": "Mật khẩu",
        "icon": "eye",
        "name": "password",
        "secureTextEntry": true
    }];
    const [loading, setLoading] = React.useState(false);
    const nav = useNavigation();
    const dispatch = useContext(MyDispatchContext);

    const updateSate = (field, value) => {
        setUser(current => {
            return {...current, [field]: value}
        });
    }

    const login = async () => {
        setLoading(true);
        try {
            let res = await APIs.post(endpoints['login'], {
                ...user,
                'client_id': 'Xx3MdHxmJSC3nLTtp7s9jlImYDBOv8fX8blZchbs',
                'client_secret': '24j2gRnkO4CI811To1JxWDlhavmfjm2x1K4wKSOisGUBi1wuMRfJbZkE8JNVgurMoMXTUfMab4ZLevDhwqKJ0QNLnwrQYlkUws4MRdANr9DNxEopzqmNeA0pWzkx5jpM',
                'grant_type': 'password'
            });
            console.info(res.data);

            await AsyncStorage.setItem("token", res.data.access_token);
            
            setTimeout(async () => {
                let user = await authApi(res.data.access_token).get(endpoints['current-user']);
                console.info(user.data);

                dispatch({
                    'type': "login",
                    'payload': user.data
                })

                nav.navigate('Home');
            }, 100);
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }   
    }

    return (
        <View style={[MyStyle.container, MyStyle.centerContainer]}>
            <Text style={MyStyle.goBack_text}>ĐĂNG NHẬP NGƯỜI DÙNG</Text>
            {fields.map(c => <TextInput secureTextEntry={c.secureTextEntry} value={user[c.name]} onChangeText={t => updateSate(c.name, t)} style={MyStyle.centerContainer} key={c.name} label={c.label} right={<TextInput.Icon icon={c.icon} />} />)}
            <Button icon="account" loading={loading} mode="contained" onPress={login}>ĐĂNG NHẬP</Button>
        </View>
    );
}

export default Login;