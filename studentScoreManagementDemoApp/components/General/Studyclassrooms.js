import { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { authApi, endpoints } from "../../configs/APIs";
import { ActivityIndicator, List } from "react-native-paper";
import MyStyle from "../../styles/MyStyle";

const StudyClassRooms = ({ navigation, route }) => {
  let token = route.params?.token;
  const [loading, setLoading] = useState(false);
  const [studyClassRooms, setStudyClassRooms] = useState([]);

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

  useEffect(() => {
    loadStudyClassRooms();
  }, []);

  return (
    <View style={[MyStyle.container, MyStyle.centerContainer]}>
      <ScrollView>
        {studyClassRooms.map((c) => {
          return (
            <TouchableOpacity
              key={c.id}
              onPress={() =>
                navigation.navigate("Students", {
                  studyclassroom_id: c.id,
                  token: token,
                })
              }
            >
              <Text>{c.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default StudyClassRooms;
