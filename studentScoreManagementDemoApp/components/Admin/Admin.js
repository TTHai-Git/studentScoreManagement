// Giao diện của giáo vụ đăng ký tài khoản cho giáo viên

import { Text, View } from "react-native";
import MyStyle from "../../styles/MyStyle";

const Admin = () => {
    return (
        <View style={[MyStyle.container, MyStyle.centerContainer]}>
            <Text>Đây là giao diện của Admin</Text>
        </View>
    );
}

export default Admin;