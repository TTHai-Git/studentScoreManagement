import React from "react";
import { View, Text } from "react-native";
import { Button, Avatar } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import ImagePicker from "react-native-image-picker";
import Styles from "../User/Styles"
import MyStyle from "../../styles/MyStyle";

const Home = () => {
    //Giá trị avatar ban đầu theo đường dẫn url
    const [avatarSource, setAvatarSource] = React.useState("https://i2.wp.com/genshinbuilds.aipurrjects.com/genshin/characters/yae_miko/image.png?strip=all&quality=75&w=256");

    //Xét role
    const option = 'student';

    let info, func_user;

    //Hàm cập nhật avatar từ thiết bị (đang lỗi chưa chỉnh)
    const chooseImage = () => {
        ImagePicker.showImagePicker({mediaType: 'photo'}, (response => {
            if (!response.didCancel) {
                setAvatarSource(response.uri);
            }
        }))
    }

    //Giao diện theo từng user
    switch (option) {
        case 'student':
            info = <View style={Styles.info}>
                        <Text style={Styles.text_name}>Họ và tên</Text>
                        <View style={Styles.info_detail}>
                            <Text style={Styles.text_detail}>MSSV:</Text>
                            <Text style={Styles.text_detail}>Email:</Text>
                            <Text style={Styles.text_detail}>Lớp:</Text>
                            <Text style={Styles.text_detail}>Khóa:</Text>
                        </View>
                    </View>;
            func_user = <View style={Styles.log_items}>
                            <Button style={Styles.button_user} mode="contained" onPress={() => console.log('Login')}> Xem danh sách môn học </Button>
                            <Button style={Styles.button_user} mode="contained" onPress={() => console.log('Login')}> Diễn đàn </Button>
                            <Button style={Styles.button_user} mode="contained" onPress={() => console.log('Login')}> Chat </Button>
                            <Button style={Styles.button_user} mode="contained" onPress={() => console.log('Login')}> Đăng xuất </Button>
                        </View>;
            break;
        case 'teacher':
            info = <View style={Styles.info}>
                        <Text style={Styles.text_name}>Họ và tên</Text>
                        <View style={Styles.info_detail}>
                            <Text style={Styles.text_detail}>Email:</Text>
                            <Text style={Styles.text_detail}>Lớp phụ trách:</Text>
                        </View>
                    </View>;
            func_user = <View style={Styles.log_items}>
                            <Button style={Styles.button_user} mode="contained" onPress={() => console.log('Login')}> Xem danh sách lớp học </Button>
                            <Button style={Styles.button_user} mode="contained" onPress={() => console.log('Login')}> Diễn đàn </Button>
                            <Button style={Styles.button_user} mode="contained" onPress={() => console.log('Login')}> Chat </Button>
                            <Button style={Styles.button_user} mode="contained" onPress={() => console.log('Login')}> Đăng xuất </Button>
                        </View>;
            break;
        case 'academicAffair':
            info = <View style={Styles.info}>
                        <Text style={Styles.text_name}>Họ và tên</Text>
                        <View style={Styles.info_detail}>
                            <Text style={Styles.text_detail}>Email:</Text>
                        </View>
                    </View>;
            func_user = <View style={Styles.log_items}>
                            <Button style={Styles.button_user} mode="contained" onPress={() => console.log('Login')}> Đăng ký tài khoản </Button>
                            <Button style={Styles.button_user} mode="contained" onPress={() => console.log('Login')}> Đăng xuất </Button>
                        </View>;
            break;
    }

    return (
        <View style={MyStyle.container}>
            <View style={Styles.avatar}>
                <Avatar.Image size={250} source={{uri: avatarSource}} />
                <Button style={Styles.avatar_button} mode="contained" onPress={chooseImage}>
                    <Icon name={'camera'} size={20} color="#000" />
                </Button>
            </View>

            {info}

            {func_user}
        </View>
    );
}

export default Home;