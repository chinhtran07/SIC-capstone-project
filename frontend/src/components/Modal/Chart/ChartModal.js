import React, { useEffect, useState } from "react";
import {
  View,
  Modal,
  Text,
  StyleSheet,
  Button,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";

const ChartModal = ({ isVisible, onClose }) => {
  const [temperatureData, setTemperatureData] = useState([]);
  const [humidityData, setHumidityData] = useState([]);
  const [soilMoistureData, setSoilMoistureData] = useState([]);

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  // Create WebSocket instance and connect
  const ws = new WebSocket('ws://192.168.2.151:8080'); // Replace with your WebSocket server URL

  useEffect(() => {
    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);

      if (data.temperature !== undefined) {
        setTemperatureData(prevData => [
          ...prevData,
          { value: data.temperature, label: new Date().toLocaleTimeString().slice(0, 5) }
        ]);
      }
      if (data.humidity !== undefined) {
        setHumidityData(prevData => [
          ...prevData,
          { value: data.humidity, label: new Date().toLocaleTimeString().slice(0, 5) }
        ]);
      }
      if (data.soilMoisture !== undefined) {
        setSoilMoistureData(prevData => [
          ...prevData,
          { value: data.soilMoisture, label: new Date().toLocaleTimeString().slice(0, 5) }
        ]);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalBackground}>
        <View style={[styles.modalContainer, { height: screenHeight - 100 }]}>
          <LineChart
            data={temperatureData}
            width={screenWidth - 40}
            height={150}
            isAnimated
            showVerticalLines={false}
            xAxisLabelStyle={{ color: "#000" }}
            yAxisLabelStyle={{ color: "#000" }}
            color="#ff5733"
            style={styles.chart}
          />
          <Text style={styles.chartTitle}>Biểu đồ nhiệt độ</Text>

          <LineChart
            data={humidityData}
            width={screenWidth - 40}
            height={150}
            isAnimated
            showVerticalLines={false}
            xAxisLabelStyle={{ color: "#000" }}
            yAxisLabelStyle={{ color: "#000" }}
            color="#33c1ff"
            style={styles.chart}
          />
          <Text style={styles.chartTitle}>Biểu đồ độ ẩm</Text>

          <LineChart
            data={soilMoistureData}
            width={screenWidth - 40}
            height={150}
            isAnimated
            showVerticalLines={false}
            xAxisLabelStyle={{ color: "#000" }}
            yAxisLabelStyle={{ color: "#000" }}
            color="#4caf50"
            style={styles.chart}
          />
          <Text style={styles.chartTitle}>Biểu đồ độ ẩm đất</Text>

          <Button title="Close" onPress={onClose} />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    maxHeight: "100%",
  },
  chart: {
    marginVertical: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 5,
    color: "#333",
  },
});

export default ChartModal;
