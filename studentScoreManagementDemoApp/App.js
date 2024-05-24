// import React, { useReducer } from "react";
// import Login from "./components/User/Login";
// import Register from "./components/User/Register";
// import Home from "./components/User/Home";
// import { createStackNavigator } from "@react-navigation/stack";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { NavigationContainer } from "@react-navigation/native";
// import { MyDispatchContext, MyUserContext } from "./configs/Contexts";
// import { Icon } from "react-native-paper";
// import Logout from "./components/User/Logout";
// import TeacherScore from "./components/Teacher/Teacher_Score";
// import TeacherList from "./components/Teacher/Teacher_List";
// import { MyUserReducer } from "./configs/Reducers";

// const Stack = createStackNavigator;
// const MyStack = () => {
//   return (
//     <Stack.Navigator>
//       <Stack.Screen>Screen 1</Stack.Screen>
//       <Stack.Screen>Screen 2</Stack.Screen>
//       <Stack.Screen>Screen 3</Stack.Screen>
//     </Stack.Navigator>
//   );
// };

// const Tab = createBottomTabNavigator();
// const MyTab = () => {
//   const [user, dispatch] = useReducer(MyUserReducer, null);

//   return (
//     <Tab.Navigator screenOptions={{ headerRight: Logout }}>
//       {/* <Tab.Screen
//         name="Home"
//         component={MyStack}
//         options={{
//           tabBarIcon: () => <Icon size={30} color="blue" source="home" />,
//         }}
//       /> */}
//       <Tab.Screen
//         name="Register"
//         component={Register}
//         options={{
//           tabBarIcon: () => <Icon size={30} color="blue" source="account" />,
//         }}
//       />
//       <Tab.Screen
//         name="Login"
//         component={Login}
//         options={{
//           tabBarIcon: () => <Icon size={30} color="blue" source="login" />,
//         }}
//       />
//       <Tab.Screen
//         name="Personal"
//         component={Home}
//         options={{
//           tabBarIcon: () => <Icon size={30} color="blue" source="human" />,
//         }}
//       />
//     </Tab.Navigator>
//   );
// };

// export default function App() {
//   const [user, dispatch] = useReducer(MyUserReducer, null);
//   return (
//     <NavigationContainer>
//       <MyUserContext.Provider value={user}>
//         <MyDispatchContext.Provider value={dispatch}>
//           <MyTab />
//         </MyDispatchContext.Provider>
//       </MyUserContext.Provider>
//     </NavigationContainer>
//   );
// }

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { Profiler, useContext, useReducer } from "react";
import { Icon } from "react-native-paper";
// import Course from './components/Course/Course';
// import Lesson from './components/Course/Lesson';
// import LessonDetails from './components/Course/LessonDetails';
import { MyDispatchContext, MyUserContext } from "./configs/Contexts";
import { MyUserReducer } from "./configs/Reducers";
import Register from "./components/User/Register";
import Login from "./components/User/Login";
import Home from "./components/User/Home";

// const Stack = createNativeStackNavigator();

// const MyStack = () => {
//   return (
//     <Stack.Navigator screenOptions={{headerShown: false}}>
//       <Stack.Screen name='Course' component={Course} options={{title: 'Khóa học'}} />
//       <Stack.Screen name='Lesson' component={Lesson} options={{title: 'Bài học'}} />
//       <Stack.Screen name='LessonDetails' component={LessonDetails} options={{title: 'Chi tiết bài học'}} />
//     </Stack.Navigator>
//   );
// }

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
