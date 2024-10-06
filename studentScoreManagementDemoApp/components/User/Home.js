import React, { useContext, useState } from "react";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Avatar } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
import { MyDispatchContext, MyUserContext } from "../../configs/Contexts";
import { authApi, endpoints } from "../../configs/APIs";
import { logOutFireBaseUser } from "../../configs/Reducers";

const Home = ({ navigation }) => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const updateState = (field, value) => {
    dispatch({ type: "updateUser", payload: { field, value } });
  };

  const picker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("iStudentScoreManagement", "Permissions Denied!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      const selectedAsset = result.assets[0];
      setSelectedImage(selectedAsset.uri);

      const formData = new FormData();
      formData.append("avatar", {
        uri: selectedAsset.uri,
        name: "userProfile.jpg",
        type: "image/jpeg",
      });

      try {
        setLoading(true);
        const res = await authApi(user.access_token).patch(
          endpoints["current-user"],
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (res.status === 200) {
          Alert.alert("Success", res.data.message);
          updateState("avatar", selectedAsset.uri);
        } else {
          Alert.alert("Error", "Failed to upload avatar. Please try again!");
        }
      } catch (error) {
        console.log(error.response);
        if (error.response && error.response.data) {
          Alert.alert("Error", error.response.data.message);
        } else {
          Alert.alert("Error", "An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  let info_detail;
  let icon_user;

  switch (user.role) {
    case "student":
      info_detail = (
        <>
          <Text style={styles.textDetail}>Mã Số Sinh Viên: {user.code}</Text>
          <Text style={styles.textDetail}>Email: {user.email}</Text>
          <Text style={styles.textDetail}>
            Lớp Sinh Viên: {user.studentclassroom_name}
          </Text>
          <Text style={styles.textDetail}>Khoa: {user.department_name}</Text>
        </>
      );

      icon_user = (
        <>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("StudyClassRooms")}
          >
            <Icon name="book" size={30} color="#fff" />
            <Text style={styles.iconButtonText}>Xem Danh Sách Lớp Học</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("ScheduleStudyClassrooms")}
          >
            <Icon name="calendar" size={30} color="#fff" />
            <Text style={styles.iconButtonText}>Xem lịch học</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("RegisterStudy")}
          >
            <Icon name="pencil" size={30} color="#fff" />
            <Text style={styles.iconButtonText}>Đăng Ký Lớp Học</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("ScoreDetails")}
          >
            <Icon name="line-chart" size={30} color="#fff" />
            <Text style={styles.iconButtonText}>Theo dõi kết quả học tập</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("EvaluateLearningResults")}
          >
            <Icon name="line-chart" size={30} color="#fff" />
            <Text style={styles.iconButtonText}>
              Theo dõi đánh giá kết quả học tập
            </Text>
          </TouchableOpacity>
        </>
      );
      break;

    case "teacher":
      info_detail = (
        <>
          <Text style={styles.textDetail}>Mã Số Giảng Viên: {user.code}</Text>
          <Text style={styles.textDetail}>Email: {user.email}</Text>
          <Text style={styles.textDetail}>Khoa: {user.department_name}</Text>
        </>
      );

      icon_user = (
        <>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("StudyClassRooms")}
          >
            <Icon name="book" size={30} color="#fff" />
            <Text style={styles.iconButtonText}>Xem danh sách lớp học</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("ScheduleStudyClassrooms")}
          >
            <Icon name="calendar" size={30} color="#fff" />
            <Text style={styles.iconButtonText}>Xem Lịch Giảng Dạy</Text>
          </TouchableOpacity>
        </>
      );
      break;

    case "admin":
      info_detail = <Text style={styles.textDetail}>Email: {user.email}</Text>;
      icon_user = (
        <>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Register")}
          >
            <Icon name="user-plus" size={30} color="#fff" />
            <Text style={styles.iconButtonText}>
              Cấp tài khoản cho người dùng
            </Text>
          </TouchableOpacity>
        </>
      );
      break;

    default:
      info_detail = null;
      icon_user = null;
  }

  return (
    <View style={[styles.container, styles.centerContainer]}>
      <View style={styles.avatarContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            {selectedImage ? (
              <Avatar.Image size={150} source={{ uri: selectedImage }} />
            ) : (
              user.avatar && (
                <View style={styles.avatarWrapper}>
                  <Avatar.Image size={150} source={{ uri: user.avatar }} />
                </View>
              )
            )}
            <TouchableOpacity style={styles.avatarButton} onPress={picker}>
              <Icon name="camera" size={30} color="#fff" />
              <Text style={styles.avatarButtonText}>Chọn Ảnh</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.textName}>
          {user.last_name} {user.first_name}
        </Text>
        <View style={styles.infoDetail}>{info_detail}</View>
      </View>

      {/* Horizontal Scroll Slider for Buttons */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.logItems}
      >
        <TouchableOpacity
          style={styles.sliderButton}
          onPress={() => navigation.navigate("UpdateInfo")}
        >
          <Icon name="user" size={30} color="#fff" />
          <Text style={styles.sliderButtonText}>
            Cập Nhật Thông Tin Người Dùng
          </Text>
        </TouchableOpacity>
        {icon_user}
        <TouchableOpacity
          style={styles.sliderButton}
          onPress={() => logOutFireBaseUser(dispatch)}
        >
          <Icon name="sign-out" size={30} color="#fff" />
          <Text style={styles.sliderButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fd",
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  avatarWrapper: {
    borderWidth: 3,
    borderColor: "#6C63FF",
    borderRadius: 150,
  },
  avatarButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#6C63FF",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarButtonText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
  },
  info: {
    alignItems: "center",
    marginBottom: 30,
  },
  textName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
  },
  infoDetail: {
    marginTop: 10,
  },
  textDetail: {
    fontSize: 16,
    color: "#555",
  },
  logItems: {
    width: "100%",
    marginTop: 20,
  },
  sliderButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#6C63FF",
    borderRadius: 15,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  sliderButtonText: {
    marginLeft: 15,
    color: "#fff",
    fontSize: 16,
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#6C63FF",
    borderRadius: 15,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  iconButtonText: {
    marginLeft: 15,
    color: "#fff",
    fontSize: 16,
  },
});

export default Home;
