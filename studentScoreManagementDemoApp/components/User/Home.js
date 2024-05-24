import { useContext } from "react";
import { View, Text } from "react-native";
import { Button, Avatar } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import ImagePicker from "react-native-image-picker";
import MyStyle from "../../styles/MyStyle";
import { MyDispatchContext, MyUserContext } from "../../configs/Contexts";

const Home = ({ navigation }) => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext);

  const picker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") Alert.alert("iCourseApp", "Permissions Denied!");
    else {
      let res = await ImagePicker.launchImageLibraryAsync();
      if (!res.canceled) {
        updateSate("avatar", res.assets[0]);
      }
    }
  };

  const updateSate = () => {
    setUser((current) => {
      return {current};
    });
  };

  //Giao diện theo từng user
  switch (user.role) {
    case 'student':
      info_detail = (<>
        <Text style={Styles.text_detail}>MSSV:</Text>
        <Text style={Styles.text_detail}>Email:</Text>
        <Text style={Styles.text_detail}>Lớp:</Text>
        <Text style={Styles.text_detail}>Khóa:</Text>
      </>)
            
      button_user = (<>
        <Button style={MyStyle.button_user} mode="contained" onPress={() => console.log('Login')}> Xem danh sách các môn đang học </Button>
        <Button style={MyStyle.button_user} mode="contained" onPress={() => console.log('Login')}> Xem điểm </Button>
      </>)
      break;

    case 'teacher':
      info_detail = (<>
        <Text style={Styles.text_detail}>Email:</Text>
        <Text style={Styles.text_detail}>Lớp phụ trách:</Text>
      </>) 
        
      button_user = <Button style={MyStyle.button_user} mode="contained" onPress={() => console.log('Login')}> Xem danh sách lớp học </Button>
      break;
        
    case 'admin':
      info_detail = <Text style={Styles.text_detail}>Email:</Text>
      button_user = <Button style={MyStyle.button_user} mode="contained" onPress={() => console.log('Login')}> Đăng ký tài khoản </Button>
      break;
    }

  return (

    <View style={[MyStyle.container, MyStyle.centerContainer]}>

      <View style={Styles.avatar}>
          <Avatar.Image size={250} source={{uri: user.avatar.uri}} />
            <Button style={Styles.avatar_button} mode="contained" onPress={picker}>
              <Icon name={'camera'} size={20} color="#000" />
            </Button>
      </View>

      <View style={Styles.info}>
        <Text style={Styles.text_name}> {user.last_name} {user.first_name} </Text>
        <View style={Styles.info_detail}>
          {info_detail}
        </View>
      </View>;

      <View style={Styles.log_items}>
        {button_user}
        <Button style={MyStyle.button_user} mode="contained" onPress={() => console.log('Chat')}> Chat </Button>
        <Button style={MyStyle.button_user} mode="contained" onPress={() => dispatch({ type: 'logout'})}> Đăng xuất </Button>
      </View>;

    </View>
  );
};

export default Home;
