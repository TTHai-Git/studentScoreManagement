import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { TextInput, Button } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import Styles from "../User/Styles"

const Login = () => {
    const [email, setEmail] = React.useState("")

    const [password, setPassword] = React.useState("")

    const [showPassword, setShowPassword] = React.useState(false);

    const [selectedValue, setSelectedValue] = React.useState("student");

    return (
        <View style={Styles.log}>
            <View style={Styles.log_items}>
                <TextInput style={Styles.input}
                    label="Email"
                    value={email}
                    onChangeText={email => setEmail(email)}
                />
            </View>

            <View style={Styles.log_items}>
                <TextInput style={Styles.input}
                    label="Mật khẩu"
                    value={password}
                    onChangeText={password => setPassword(password)}
                    secureTextEntry={!showPassword}
                />

                <TouchableOpacity style={{ position: 'absolute', right: 10, top: 15}}
                    onPress={() => setShowPassword(!showPassword)}>
                    <Icon name={showPassword ? 'eye-slash' : 'eye'} size={25} color="#000" />
                </TouchableOpacity>
            </View>

            <View style={Styles.log_items}>
                <Picker style={Styles.input}
                    selectedValue={selectedValue}
                    onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
                >
                    <Picker.Item label="Sinh viên" value="student" />
                    <Picker.Item label="Giáo vụ" value="academic_affair" />
                    <Picker.Item label="Giảng viên" value="teacher" />
                </Picker>
            </View>

            <View style={Styles.button}>
                <Button mode="contained" onPress={() => console.log('Login')}> Đăng nhập </Button>
                <Button mode="contained" onPress={() => console.log('Register')}> Đăng ký </Button>
            </View>
        </View>
    );
}

export default Login;