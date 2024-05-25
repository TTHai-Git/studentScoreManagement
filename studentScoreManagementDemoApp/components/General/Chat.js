// Khung chat giữa sinh viên và giáo viên

import { Text, View } from "react-native";
import MyStyle from "../../styles/MyStyle";

const Chat = () => {
    return (
        <View style={[MyStyle.container, MyStyle.centerContainer]}>
            <Text>Đây là giao diện của Chat</Text>
        </View>
    );
}

export default Chat;