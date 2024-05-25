import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { authApi, endpoints } from "../../configs/APIs";
import { ActivityIndicator, Button, List, Modal, PaperProvider, Portal, Provider } from "react-native-paper";
import MyStyle from "../../styles/MyStyle";
import Styles from "../General/Styles";

const StudyClassRooms = ({ navigation, route }) => {
  let token = route.params?.token;
  const [loading, setLoading] = useState(false);
  const [studyClassRooms, setStudyClassRooms] = useState([]);

  const [visible, setVisible] = React.useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const loadStudyClassRooms = async () => {
    setLoading(true);
    try {
      let res = await authApi(token).get(endpoints["studyclassrooms"]);

      //   console.log(res.data.results);Da
      setStudyClassRooms(res.data.results);
      console.log(studyClassRooms);
    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  const goTopic = (studyclassroom_id) => {
    navigation.navigate('Topics', {"studyclassroom_id": studyclassroom_id, "token": token});
  }

  const goListStudentScores = (studyclassroom_id) => {
    navigation.navigate('ListStudentScores', {"studyclassroom_id": studyclassroom_id, "token": token});
  }

  const goListStudents = (studyclassroom_id) => {
    navigation.navigate('ListStudents', {"studyclassroom_id": studyclassroom_id, "token": token});
  }

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
                  <Portal>
                    <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={Styles.modal}>
                      <View>
                          <Button style={MyStyle.button_user} mode="contained" onPress={() => navigation.navigate("ListStudents")}> Xem danh sách sinh viên </Button>
                          <Button style={MyStyle.button_user} mode="contained" onPress={() => navigation.navigate("ListStudentScores")}> Quản lý điểm </Button>
                          <Button style={MyStyle.button_user} mode="contained" onPress={() => navigation.navigate("Topics")}> Diễn đàn </Button>
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
           </ScrollView>
        </View>

    </Provider>
  );
};

export default StudyClassRooms;
