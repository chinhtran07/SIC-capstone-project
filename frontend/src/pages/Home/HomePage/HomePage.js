import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from "react-native";
import Header from "../../../components/Header/Header";
import ThresholdEditor from "../../../components/ThresholdEditor/ThresholdEditor";
import ChartModal from "../../../components/Modal/Chart/ChartModal";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function HomePage() {
  const [isPumpOn, setIsPumpOn] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [humidity, setHumidity] = useState(0.0);
  const [temperature, setTemperature] = useState(0.0);
  const [soilMoisture, setSoilMoisture] = useState(0);

  const ws = new WebSocket('ws://192.168.2.151:8080');

  useEffect(() => {
    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.temperature !== undefined) {
        setTemperature(parseFloat(data.temperature.toFixed(2)));
      }
      if (data.humidity !== undefined) {
        setHumidity(parseFloat(data.humidity.toFixed(2)));
      }
      if (data.soilMoisture !== undefined) {
        setSoilMoisture(data.soilMoisture);
      }
      if (data.relayStatus !== undefined) {
        setIsPumpOn(data.relayStatus);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    return () => {
      ws.close();
    };
  }, []);

  const togglePump = () => {
    const newPumpStatus = !isPumpOn;
    setIsPumpOn(newPumpStatus);

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'control',
        device: 'pump',
        action: newPumpStatus ? 'on' : 'off',
      }));
    } else {
      console.error('WebSocket is not open. Unable to send message.');
    }
  };

  const showModal = () => setIsModalVisible(true);
  const hideModal = () => setIsModalVisible(false);

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.infoBox}>
          <View style={styles.infoItem}>
            <Icon name="thermometer" size={28} color="#4CAF50" style={styles.icon} />
            <View style={styles.textContainer}>
              <Text style={styles.infoLabel}>Nhiệt độ</Text>
              <Text style={styles.infoValue}>{temperature} °C</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoItem}>
            <Icon name="water-percent" size={28} color="#4CAF50" style={styles.icon} />
            <View style={styles.textContainer}>
              <Text style={styles.infoLabel}>Độ ẩm</Text>
              <Text style={styles.infoValue}>{humidity} %</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoItem}>
            <Icon name="water" size={28} color="#4CAF50" style={styles.icon} />
            <View style={styles.textContainer}>
              <Text style={styles.infoLabel}>Độ ẩm đất</Text>
              <Text style={styles.infoValue}>{soilMoisture} %</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.button} onPress={showModal}>
          <Text style={styles.buttonText}>Xem biểu đồ</Text>
        </TouchableOpacity>
        <View style={styles.footer}>
          <Text style={styles.switchLabel}>Bật/tắt máy bơm:</Text>
          <Switch
            value={isPumpOn}
            onValueChange={togglePump}
            trackColor={{ false: "#d1d1d1", true: "#81c743" }}
            thumbColor={isPumpOn ? "#fff" : "#f4f3f4"}
          />
        </View>
        <ThresholdEditor />
      </ScrollView>
      <ChartModal isVisible={isModalVisible} onClose={hideModal} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20, // Ensure there's space at the bottom for scrolling
  },
  infoBox: {
    marginVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: 10, // Ensure margin on both sides
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  icon: {
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 24,
    color: "#000",
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: 200,
    alignSelf: "center",
    marginVertical: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    marginHorizontal: 20,
    marginTop: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: "#333",
  },
});
