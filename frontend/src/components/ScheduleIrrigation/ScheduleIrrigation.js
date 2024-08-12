import React, { useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
export default function ScheduledList() {
  const [schedules, setSchedules] = useState([
    "08:00 AM",
    "12:00 PM",
    "06:00 PM",
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scheduleBox}>
        <Text style={styles.title}>Hẹn giờ tưới cây:</Text>
        <FlatList
          data={schedules}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleTime}>{item}</Text>
              <TouchableOpacity>
                <Icon name="clock-o" size={32} color="black" />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  scheduleBox: {
    width: "100%",
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  scheduleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 10,
    height: 70,
    marginVertical: 10,
  },
  scheduleTime: {
    fontSize: 16,
    color: "#333",
  },
  removeText: {
    color: "#ff4d4d",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "black",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
