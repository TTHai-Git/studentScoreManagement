import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { authApi, endpoints } from "../../configs/APIs";
import {
  ActivityIndicator,
  Button,
  List,
  Modal,
  PaperProvider,
  Portal,
  Provider,
} from "react-native-paper";
import MyStyle from "../../styles/MyStyle";
import Styles from "../General/Styles";

const StudyClassRooms = ({ navigation, route }) => {
  let token = route.params?.token;
  let user = route.params?.user;
  const [loading, setLoading] = useState(false);
  const [studyClassRooms, setStudyClassRooms] = useState([]);

  const [studyclassroom_id, setsStudyClassroom_id] = useState(null);

  const [visible, setVisible] = React.useState(false);

  let showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const loadStudyClassRooms = async () => {
    setLoading(true);
    console.log(user);
    console.log(token);
    try {
      let url = "";
      if (user.role === "teacher") {
        url = `${endpoints["studyclassrooms"]}`;
      } else {
        url = `${endpoints["studyclassroomsofstudent"](user.id)}`;
      }
      let res = await authApi(token).get(url);
      console.log(res.data.results);
      setStudyClassRooms(res.data.results);
      // console.log(studyClassRooms);
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  const goTopics = () => {
    navigation.navigate("Topics", {
      studyclassroom_id: studyclassroom_id,
      token: token,
      user: user,
    });
  };

  const goListStudentScores = () => {
    navigation.navigate("ListStudentScores", {
      studyclassroom_id: studyclassroom_id,
      token: token,
      user: user,
    });
  };

  const goListStudents = () => {
    navigation.navigate("ListStudents", {
      studyclassroom_id: studyclassroom_id,
      token: token,
      user: user,
    });
  };

  useEffect(() => {
    loadStudyClassRooms();
  }, []);

  return (
    <Provider>
      {/* <View style={MyStyle.container}>
          <ScrollView>
            {studyClassRooms.map((c) => {
              return (
                <View>
                  <Portal>
                    <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={Styles.modal}>
                      <View>
                          <Button style={MyStyle.button_user} key={c.id} mode="contained" onPress={() => goListStudents(c.id)}> Xem danh sách sinh viên </Button>
                          <Button style={MyStyle.button_user} key={c.id} mode="contained" onPress={() => goListStudentScores(c.id)}> Quản lý điểm </Button>
                          <Button style={MyStyle.button_user} key={c.id} mode="contained" onPress={() => goTopic(c.id)}> Diễn đàn </Button>
                      </View>
                    </Modal>
                  </Portal>

                  <ScrollView>
                    <TouchableOpacity onPress={showModal}>
                      <View style={Styles.class}>
                        <Text style={Styles.text_class}>Lớp: </Text>
                        <Text style={Styles.text_class}>Môn: </Text>
                    </View>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              );      
            })}
           </ScrollView>
        </View> */}

      <View style={MyStyle.container}>
        <ScrollView>
          <View>
            {studyClassRooms.map((c) => {})}
            <Portal>
              <Modal
                visible={visible}
                onDismiss={hideModal}
                contentContainerStyle={Styles.modal}
              >
                <View>
                  {user.role === "teacher" ? (
                    <>
                      <Button
                        style={MyStyle.button_user}
                        mode="contained"
                        onPress={goListStudents}
                      >
                        {" "}
                        Xem danh sách sinh viên{" "}
                      </Button>
                      <Button
                        style={MyStyle.button_user}
                        mode="contained"
                        onPress={goListStudentScores}
                      >
                        {" "}
                        Quản lý điểm{" "}
                      </Button>
                      <Button
                        style={MyStyle.button_user}
                        mode="contained"
                        onPress={goTopics}
                      >
                        {" "}
                        Diễn đàn{" "}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        style={MyStyle.button_user}
                        mode="contained"
                        onPress={goTopics}
                      >
                        {" "}
                        Diễn đàn{" "}
                      </Button>
                    </>
                  )}
                </View>
              </Modal>
            </Portal>

            <ScrollView>
              {studyClassRooms.map((c) => {
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => [showModal(), setsStudyClassroom_id(c.id)]}
                  >
                    <View style={Styles.class}>
                      <Text style={Styles.text_class}>Lớp: {c.name} </Text>
                      <Text style={Styles.text_class}>
                        Môn: {c.subject_name}{" "}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </Provider>
  );
};

export default StudyClassRooms;
