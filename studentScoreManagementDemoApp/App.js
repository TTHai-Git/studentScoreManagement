import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import React, { Profiler, useContext, useReducer } from "react";
import { Icon } from "react-native-paper";
import { MyDispatchContext, MyUserContext } from "./configs/Contexts";
import { MyUserReducer } from "./configs/Reducers";
import Register from "./components/User/Register";
import Login from "./components/User/Login";
import Home from "./components/User/Home";
import StudyClassRooms from "./components/General/Studyclassrooms";
import Students from "./components/Teacher/ListStudent";
import ListStudentScores from "./components/Teacher/ListStudentScore";
import Topics from "./components/General/Topics";
import ScoreDetails from "./components/Student/ScoreDetails";

const Tab = createBottomTabNavigator();

const MyTab = () => {
  const user = useContext(MyUserContext);

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      {/* <Tab.Screen name="Home" component={MyStack} options={{ title: "Khóa học", tabBarIcon: () => <Icon size={30} color="blue" source="home" />}} /> */}
      {user === null ? (
        <>
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
          <Tab.Screen
            name="Login"
            component={Login}
            options={{
              title: "Đăng nhập",
              tabBarIcon: () => <Icon size={30} color="blue" source="login" />,
            }}
          />
        </>
      ) : (
        <>
          <Tab.Screen
            name="Home"
            component={Home}
            options={{
              title: user.username,
              tabBarIcon: () => (
                <Icon size={30} color="blue" source="account" />
              ),
            }}
          />
          <Tab.Screen
            name="StudyClassRooms"
            component={StudyClassRooms}
            options={{
              tabBarIcon: () => (
                <Icon size={30} color="blue" source="account" />
              ),
            }}
          />
          <Tab.Screen
            name="Students"
            component={Students}
            options={{
              tabBarIcon: () => (
                <Icon size={30} color="blue" source="account" />
              ),
            }}
          />
          <Tab.Screen
            name="ListStudentScores"
            component={ListStudentScores}
            options={{
              tabBarIcon: () => (
                <Icon size={30} color="blue" source="account" />
              ),
            }}
          />
          <Tab.Screen
            name="Topics"
            component={Topics}
            options={{
              tabBarIcon: () => <Icon size={30} color="blue" source="topic" />,
            }}
          />
          <Tab.Screen
            name="Topics"
            component={Topics}
            options={{
              tabBarIcon: () => <Icon size={30} color="blue" source="topic" />,
            }}
          />
          <Tab.Screen
            name="ScoreDetails"
            component={ScoreDetails}
            options={{
              tabBarIcon: () => <Icon size={30} color="blue" source="topic" />,
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
