import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
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
    const [user, setUser] = React.useState({});
    const [selectedValue, setSelectedValue] = React.useState("student");
    const fields = [{
        "label": "Tên đăng nhập",
        "name": "username"
    }, {
        "label": "Mật khẩu",
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

                    <Button mode="contained" onPress={() => console.log('Login')}> Đăng nhập </Button>

                </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

export default Login;