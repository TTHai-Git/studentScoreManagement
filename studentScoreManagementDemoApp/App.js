import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import React, { useContext, useReducer } from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Import from react-native-vector-icons
import { MyDispatchContext, MyUserContext } from "./configs/Contexts";
import { MyUserReducer } from "./configs/Reducers";
import Register from "./components/User/Register";
import Login from "./components/User/Login";
import Home from "./components/User/Home";
import ListStudentScores from "./components/Teacher/ListStudentScores";
import Topics from "./components/General/Topics";
import ScoreDetails from "./components/Student/ScoreDetails";
import { createStackNavigator } from "@react-navigation/stack";
import ListStudents from "./components/Teacher/ListStudents";
import Comments from "./components/General/Comments";

import ChatList from "./components/General/ChatList";
import ChatRoom from "./components/General/ChatRoom";
import StudyClassRooms from "./components/General/Studyclassrooms";

import ForgotPassword from "./components/User/ForgotPassword";
import RegisterStudy from "./components/Student/RegisterStudy";
import UpdateInfo from "./components/User/UpdateInfo";
import ScheduleStudyClassrooms from "./components/General/ScheduleStudyClassrooms";
import UpdateSchedule from "./components/General/UpdateSchedule";
import NewSchedule from "./components/Admin/NewSchedule";
import EvaluateLearningResults from "./components/Student/EvaluateLearningResults";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MyStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" options={{ title: "Home" }} component={Home} />
      <Stack.Screen
        name="UpdateInfo"
        options={{ title: "Thông Tin Người Dùng" }}
        component={UpdateInfo}
      />
      <Stack.Screen
        name="ScheduleStudyClassrooms"
        options={{ title: "Lịch Học" }}
        component={ScheduleStudyClassrooms}
      />
      <Stack.Screen
        name="NewSchedule"
        component={NewSchedule}
        options={{
          title: "Form Lập Lịch Học",
          presentation: "transparentModal",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="UpdateSchedule"
        component={UpdateSchedule}
        options={{
          title: "Form Tạo Lịch Học",
          presentation: "transparentModal",
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="StudyClassRooms"
        options={{ title: "Danh sách lớp học" }}
        component={StudyClassRooms}
      />
      <Stack.Screen
        name="RegisterStudy"
        options={{ title: "Đăng ký lớp học" }}
        component={RegisterStudy}
      />
      <Stack.Screen
        name="Topics"
        options={{ title: "Diễn đàn" }}
        component={Topics}
      />
      <Stack.Screen
        name="Comments"
        options={{ title: "Bình luận" }}
        component={Comments}
      />
      <Stack.Screen
        name="ScoreDetails"
        options={{ title: "Theo dõi kết quả học tập" }}
        component={ScoreDetails}
      />
      <Stack.Screen
        name="EvaluateLearningResults"
        options={{ title: "Đánh giá kết quả học tập" }}
        component={EvaluateLearningResults}
      />
      <Stack.Screen
        name="ListStudents"
        options={{ title: "Danh sách sinh viên" }}
        component={ListStudents}
      />
      <Stack.Screen
        name="ListStudentScores"
        options={{ title: "Quản lý điểm sinh viên" }}
        component={ListStudentScores}
      />
      <Stack.Screen
        key="Register"
        name="Register"
        component={Register}
        options={{
          title: "Cấp tài khoản cho người dùng",
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-plus" size={size} color={color} />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

const MyChatStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ChatList"
        options={{ title: "Danh sách Chat" }}
        component={ChatList}
      />
      <Stack.Screen
        name="ChatRoom"
        options={{ title: "Phòng Chat" }}
        component={ChatRoom}
      />
    </Stack.Navigator>
  );
};

const MyTab = () => {
  const user = useContext(MyUserContext);

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      {user === null ? (
        <>
          <Tab.Screen
            key="Login"
            name="Login"
            component={Login}
            options={{
              title: "Đăng nhập",
              tabBarIcon: ({ color, size }) => (
                <Icon name="home" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            key="ForgotPassword"
            name="ForgotPassword"
            component={ForgotPassword}
            options={{
              title: "Quên mật khẩu",
              tabBarIcon: ({ color, size }) => (
                <Icon name="lock-reset" size={size} color={color} />
              ),
            }}
          />
        </>
      ) : (
        <>
          <Tab.Screen
            key="MyStack"
            name="MyStack"
            component={MyStack}
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <Icon name="home" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            key="MyChatStack"
            name="MyChatStack"
            component={MyChatStack}
            options={{
              title: "Chat",
              tabBarIcon: ({ color, size }) => (
                <Icon name="chat" size={size} color={color} />
              ),
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
};

export default function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <NavigationContainer>
      <MyUserContext.Provider value={user}>
        <MyDispatchContext.Provider value={dispatch}>
          <MyTab />
        </MyDispatchContext.Provider>
      </MyUserContext.Provider>
    </NavigationContainer>
  );
}
