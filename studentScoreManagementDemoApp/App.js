import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import React, { useContext, useReducer } from "react";
import { Icon } from "react-native-paper";
import { MyDispatchContext, MyUserContext } from "./configs/Contexts";
import { MyUserReducer } from "./configs/Reducers";
import Register from "./components/User/Register";
import Login from "./components/User/Login";
import Home from "./components/User/Home";
import StudyClassRooms from "./components/General/Studyclassrooms";
import ListStudentScores from "./components/Teacher/ListStudentScores";
import Topics from "./components/General/Topics";
import ScoreDetails from "./components/Student/ScoreDetails";
import Chat from "./components/General/Chat";
import { createStackNavigator } from "@react-navigation/stack";
import ListStudents from "./components/Teacher/ListStudents";
import Comments from "./components/General/Comments";
import Admin from "./components/Admin/Admin";

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

      {/* Giao diện chung của sinh viên và giảng viên */}
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

      {/* Giao diện của sinh viên */}
      <Stack.Screen
        name="ScoreDetails"
        options={{ title: "Điểm các môn học" }}
        component={ScoreDetails}
      />

      {/* Giao diện của giảng viên */}
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

      {/* Giao diện của admin */}
      <Stack.Screen
        name="Admin"
        options={{ title: "Đăng ký tài khoản giảng viên" }}
        component={Admin}
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
            name="Login"
            component={Login}
            options={{
              title: "Đăng nhập",
              tabBarIcon: () => <Icon size={30} color="blue" source="login" />,
            }}
          />

          <Tab.Screen
            name="Register"
            component={Register}
            options={{
              title: "Đăng ký",
              tabBarIcon: () => (
                <Icon size={30} color="blue" source="account" />
              ),
            }}
          />
        </>
      ) : (
        <>
          <Tab.Screen
            name="MyStack"
            component={MyStack}
            options={{
              title: "Trang chủ",
              tabBarIcon: () => <Icon size={30} color="blue" source="home" />,
            }}
          />
          <Tab.Screen 
            name="Chat" 
            component={Chat} 
            options={{
              title: "Chat",
              tabBarIcon: () => <Icon size={30} color="blue" source="chat" />,
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
