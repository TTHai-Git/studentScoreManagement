// import React, { useState } from "react";
// import { View, TouchableOpacity, Text, PermissionsAndroid, Image, ActivityIndicator, ScrollView } from "react-native";
// import { launchCamera, launchImageLibrary } from "react-native-image-picker";
// import { Button, TextInput } from "react-native-paper";
// import Icon from "react-native-vector-icons/FontAwesome";
// import Styles from "../User/Styles";
// import MyStyle from "../../styles/MyStyle";
// import APIs, { endpoints } from "../../configs/APIs";

// const Register = ({ navigation }) => {
//   const [user, setUser] = React.useState({
//     first_name: "",
//     last_name: "",
//     username: "",
//     password: "",
//     email: "",
//     avatar:
//       "https://i2.wp.com/genshinbuilds.aipurrjects.com/genshin/characters/yae_miko/image.png?strip=all&quality=75&w=256",
//   });

//   const [confirm_password, setConfirm_Password] = React.useState("");

//   const [showPassword, setShowPassword] = React.useState(false);

//   const [loading, setLoading] = React.useState(false);

//   const register = async () => {
//     setLoading(true);

//     const form = new FormData();
//     for (let key in user)
//       if (key === "avatar") {
//         form.append(key, {
//           uri: user[key].uri,
//           name: user[key].fileName,
//           type: user[key].type,
//         });
//       } else form.append(key, user[key]);

//     try {
//       setLoading(true);
//       let res = await APIs.post(endpoints["register"], form, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       console.info(res.data);
//       navigation.navigate("Login");
//     } catch (ex) {
//         console.error(ex);
//     } finally {
//         setLoading(false);
//         console.log(user);
//     }
//   };

//   const picker = async () => {
//     try {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.CAMERA
//       );
//       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//         console.log("Camera permission given");
//         const result = await launchImageLibrary({
//           mediaType: "photo",
//           cameraType: "front",
//         });
//         change("avatar", result.assets[0].uri);
//       } else {
//         console.log("Camera permission denied");
//       }
//     } catch (err) {
//       console.warn(err);
//     }
//   };

//   const change = (field, value) => {
//     setUser((current) => {
//       return { ...current, [field]: value };
//     });
//   };

//   return (
//     // <ScrollView>
//     //   <View style={[MyStyle.container, MyStyle.centerContainer]}>
//     //     <View style={Styles.log_items}>
//     //       <TextInput
//     //         style={Styles.input}
//     //         label="First_Name"
//     //         value={user.first_name}
//     //         onChangeText={(first_name) => change("first_name", first_name)}
//     //       />
//     //     </View>

//     //     <View style={Styles.log_items}>
//     //       <TextInput
//     //         style={Styles.input}
//     //         label="Last_Name"
//     //         value={user.last_name}
//     //         onChangeText={(last_name) => change("last_name", last_name)}
//     //       />
//     //     </View>

//     //     <View style={Styles.log_items}>
//     //       <TextInput
//     //         style={Styles.input}
//     //         label="UserName"
//     //         value={user.username}
//     //         onChangeText={(username) => change("username", username)}
//     //       />
//     //     </View>

//     //     <View style={Styles.log_items}>
//     //       <TextInput
//     //         style={Styles.input}
//     //         label="Mật khẩu"
//     //         value={user.password}
//     //         onChangeText={(password) => change("password", password)}
//     //         secureTextEntry={!showPassword}
//     //       />

//     //       <TouchableOpacity
//     //         style={{ position: "absolute", right: 10, top: 15 }}
//     //         onPress={() => setShowPassword(!showPassword)}
//     //       >
//     //         <Icon
//     //           name={showPassword ? "eye-slash" : "eye"}
//     //           size={25}
//     //           color="#000"
//     //         />
//     //       </TouchableOpacity>
//     //     </View>

//     //     <View style={Styles.log_items}>
//     //       <TextInput
//     //         style={Styles.input}
//     //         label="Xác nhận lại mật khẩu"
//     //         value={confirm_password}
//     //         onChangeText={(confirm_password) =>
//     //           setConfirm_Password(confirm_password)
//     //         }
//     //         secureTextEntry={!showPassword}
//     //       />

//     //       <TouchableOpacity
//     //         style={{ position: "absolute", right: 10, top: 15 }}
//     //         onPress={() => setShowPassword(!showPassword)}
//     //       >
//     //         <Icon
//     //           name={showPassword ? "eye-slash" : "eye"}
//     //           size={25}
//     //           color="#000"
//     //         />
//     //       </TouchableOpacity>
//     //     </View>

//     //     <View style={Styles.log_items}>
//     //       <TextInput
//     //         style={Styles.input}
//     //         label="Email"
//     //         value={user.email}
//     //         onChangeText={(email) => change("email", email)}
//     //       />
//     //     </View>

//     //     <View style={Styles.log_items}>
//     //       <TouchableOpacity style={Styles.input} onPress={picker}>
//     //         <Text>Chọn ảnh đại diện...</Text>
//     //       </TouchableOpacity>
//     //       {user.avatar ? <Image style={Styles.avatar} source={{ uri: user.avatar.uri }} /> : ""}

//     //       {loading === true ? <ActivityIndicator /> : <>
//     //           <Button
//     //             style={Styles.button_user}
//     //             mode="contained"
//     //             onPress={register}
//     //           >
//     //             Đăng Ký
//     //           </Button>
//     //         </>}
//     //     </View>
//     //   </View>
//     // </ScrollView>

//     <View style={[MyStyle.container, MyStyle.centerContainer]}>
//         <View style={Styles.log_items}>
//           <TextInput
//             style={Styles.input}
//             label="Tên"
//             value={user.first_name}
//             onChangeText={(first_name) => change("first_name", first_name)}
//           />
//         </View>

//         <View style={Styles.log_items}>
//           <TextInput
//             style={Styles.input}
//             label="Họ"
//             value={user.last_name}
//             onChangeText={(last_name) => change("last_name", last_name)}
//           />
//         </View>

//         <View style={Styles.log_items}>
//           <TextInput
//             style={Styles.input}
//             label="Email"
//             value={user.email}
//             onChangeText={(email) => change("email", email)}
//           />
//         </View>

//         <View style={Styles.log_items}>
//           <TextInput
//             style={Styles.input}
//             label="Tài khoản"
//             value={user.username}
//             onChangeText={(username) => change("username", username)}
//           />
//         </View>

//         <View style={Styles.log_items}>
//           <TextInput
//             style={Styles.input}
//             label="Mật khẩu"
//             value={user.password}
//             onChangeText={(password) => change("password", password)}
//             secureTextEntry={!showPassword}
//           />

//           <TouchableOpacity
//             style={{ position: "absolute", right: 10, top: 15 }}
//             onPress={() => setShowPassword(!showPassword)}
//           >
//             <Icon
//               name={showPassword ? "eye-slash" : "eye"}
//               size={25}
//               color="#000"
//             />
//           </TouchableOpacity>
//         </View>

//         <View style={Styles.log_items}>
//           <TextInput
//             style={Styles.input}
//             label="Xác nhận lại mật khẩu"
//             value={confirm_password}
//             onChangeText={(confirm_password) =>
//               setConfirm_Password(confirm_password)
//             }
//             secureTextEntry={!showPassword}
//           />

//           <TouchableOpacity
//             style={{ position: "absolute", right: 10, top: 15 }}
//             onPress={() => setShowPassword(!showPassword)}
//           >
//             <Icon
//               name={showPassword ? "eye-slash" : "eye"}
//               size={25}
//               color="#000"
//             />
//           </TouchableOpacity>
//         </View>

//         <View style={Styles.log_items}>
//           <TouchableOpacity style={Styles.input} onPress={picker}>
//             <Text>Chọn ảnh đại diện...</Text>
//           </TouchableOpacity>
//           {user.avatar ? <Image style={Styles.avatar} source={{ uri: user.avatar.uri }} /> : ""}

//           {loading === true ? <ActivityIndicator /> : <>
//               <Button
//                 style={Styles.button_user}
//                 mode="contained"
//                 onPress={register}
//               >
//                 Đăng Ký
//               </Button>
//             </>}
//         </View>
//       </View>
//   );
// };

// export default Register;

import { View, Text, Alert, Image, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { Button, HelperText, Icon, TextInput, TouchableRipple } from "react-native-paper";
import MyStyle from "../../styles/MyStyle";
import * as ImagePicker from 'expo-image-picker';
import React from "react";
import APIs, { endpoints } from "../../configs/APIs";
import { useNavigation } from "@react-navigation/native";
import Styles from "../User/Styles";

const Register = () => {
    const [user, setUser] = React.useState({});
    const [err, setErr] = React.useState(false);

    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const fields = [{
        "label": "Tên",
        "name": "first_name"
    }, {
        "label": "Họ và tên lót",
        "name": "last_name"
    }, {
        "label": "Email",
        "name": "email"
    }, {
        "label": "Tên đăng nhập",
        "name": "username"
    }, {
        "label": "Mật khẩu",
        "icon": "eye",
        "name": "password",
        "secureTextEntry": true
    }, {
        "label": "Xác nhận mật khẩu",
        "icon": "eye",
        "name": "confirm",
        "secureTextEntry": true
    }];
    const nav = useNavigation();
    const [loading, setLoading] = React.useState(false);

    const picker = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted')
            Alert.alert("iCourseApp", "Permissions Denied!");
        else {
            let res = await ImagePicker.launchImageLibraryAsync();
            if (!res.canceled) {
                updateSate("avatar", res.assets[0]);
            }
        }
    }

    const updateSate = (field, value) => {
        setUser(current => {
            return {...current, [field]: value}
        });
    }

    const register = async () => {
        if (user['password'] !== user['confirm'])
            setErr(true);
        else {
            setErr(false);

            let form = new FormData();
            for (let key in user)
                if (key !== 'confirm')
                    if (key === 'avatar') {
                        form.append(key, {
                            uri: user.avatar.uri,
                            name: user.avatar.fileName,
                            type: user.avatar.type
                        });
                    } else
                        form.append(key, user[key]);
            
            console.info(form);
            setLoading(true);
            try {
                let res = await APIs.post(endpoints['register'], form, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
    
                if (res.status === 201)
                    nav.navigate("Login");
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <View style={[MyStyle.container]}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={Styles.log_items}>
                    {fields.map(c => (
                            <View key={c.name} style={{ width: '100%', position: 'relative' }}>
                                <TextInput
                                    secureTextEntry={c.name === 'password' ? !showPassword : (c.name === 'confirm' ? !showConfirmPassword : false)}
                                    value={user[c.name]}
                                    onChangeText={t => updateSate(c.name, t)}
                                    style={Styles.input}
                                    label={c.label}
                                />
                                {(c.name === 'password' || c.name === 'confirm') && (
                                    <TouchableOpacity
                                        style={{ position: "absolute", right: 10, top: 30 }} // Adjust top as necessary
                                        onPress={() => {
                                            if (c.name === 'password') {
                                                setShowPassword(!showPassword);
                                            } else if (c.name === 'confirm') {
                                                setShowConfirmPassword(!showConfirmPassword);
                                            }
                                        }}
                                    >
                                        <Icon
                                            name={(c.name === 'password' ? showPassword : showConfirmPassword) ? "eye-slash" : "eye"}
                                            size={25}
                                            color="#000"
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}

                    <HelperText type="error" visible={err}>
                        Mật khẩu không khớp!
                    </HelperText>
                    
                    <TouchableRipple style={MyStyle.centerContainer} onPress={picker}>
                        <Text>Chọn ảnh đại diện...</Text>
                    </TouchableRipple>

                    {user.avatar && <Image source={{uri: user.avatar.uri}} style={Styles.avatar} />}

                    <Button icon="account" loading={loading} mode="contained" onPress={register}>ĐĂNG KÝ</Button>
                </View>
            </ScrollView>
            </KeyboardAvoidingView>   
        </View>
    );
}

export default Register;