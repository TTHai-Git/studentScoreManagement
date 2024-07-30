import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import React, { useContext, useEffect, useReducer } from "react";
import { Icon } from "react-native-paper";
import {
  AuthenticatedUserContext,
  MyDispatchContext,
  MyUserContext,
} from "./configs/Contexts";
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
import { auth } from "./configs/Firebase";
import ChatList from "./components/General/ChatList";
import ChatRoom from "./components/General/ChatRoom";
import { onAuthStateChanged } from "firebase/auth";
import StudyClassRooms from "./components/General/Studyclassrooms";
import Admin from "./components/Admin/Admin";
import ForgotPassword from "./components/User/ForgotPassword";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MyStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        options={{ title: "Trang chủ" }}
        component={Home}
      />
      <Stack.Screen
        name="StudyClassRooms"
        options={{ title: "Danh sách lớp học" }}
        component={StudyClassRooms}
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
        options={{ title: "Điểm các môn học" }}
        component={ScoreDetails}
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
        name="Admin"
        options={{ title: "Đăng ký tài khoản giảng viên" }}
        component={Admin}
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
                <Icon name="login" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            key="Register"
            name="Register"
            component={Register}
            options={{
              title: "Đăng ký",
              tabBarIcon: ({ color, size }) => (
                <Icon name="account" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="ForgotPassword"
            options={{ title: "Quên Mật Khẩu" }}
            component={ForgotPassword}
          />
        </>
      ) : (
        <>
          <Tab.Screen
            key="MyStack"
            name="MyStack"
            component={MyStack}
            options={{
              title: "Trang chủ",
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
