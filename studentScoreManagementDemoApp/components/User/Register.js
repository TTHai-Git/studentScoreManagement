import React from "react";
import { View, TouchableOpacity } from "react-native";
import { TextInput, Button } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import Styles from "../User/Styles"

const Register = () => {
    const [email, setEmail] = React.useState("")

    const [password, setPassword] = React.useState("")
    const [confirm_password, setConfirm_Password] = React.useState("")

    const [showPassword, setShowPassword] = React.useState(false);

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
                <TextInput style={Styles.input}
                    label="Xác nhận lại mật khẩu"
                    value={confirm_password}
                    onChangeText={confirm_password => setConfirm_Password(confirm_password)}
                    secureTextEntry={!showPassword}
                />

                <TouchableOpacity style={{ position: 'absolute', right: 10, top: 15}}
                    onPress={() => setShowPassword(!showPassword)}>
                    <Icon name={showPassword ? 'eye-slash' : 'eye'} size={25} color="#000" />
                </TouchableOpacity>
            </View>

            <View style={Styles.button}>
                <Button mode="contained" onPress={() => console.log('Register')}> Đăng ký </Button>
            </View>
        </View>
    );
}

export default Register;