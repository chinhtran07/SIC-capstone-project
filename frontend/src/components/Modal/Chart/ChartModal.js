import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Modal,
  Text,
  StyleSheet,
  Button,
  Dimensions,
  SafeAreaView,
  ScrollView, // Import ScrollView
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { apiClient, endpoints } from "../../../config/apis";

const ChartModal = ({ isVisible, onClose }) => {
  const [temperatureData, setTemperatureData] = useState([]);
  const [humidityData, setHumidityData] = useState([]);
  const [soilMoistureData, setSoilMoistureData] = useState([]);

  const ws = useRef(null);
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  useEffect(() => {
    const fetchDataToday = async () => {
      try {
        const response = await apiClient.get(endpoints['getDataToday']);
        if (response.status === 200) {
          const data = response.data.results;

          const formattedTemperatureData = data.map(item => ({
            value: item.temperature,
            label: new Date(item.timestamp).toLocaleTimeString().slice(0, 5) // Format time
          }));

          const formattedHumidityData = data.map(item => ({
            value: item.humidity,
            label: new Date(item.timestamp).toLocaleTimeString().slice(0, 5) // Format time
          }));

          const formattedSoilMoistureData = data.map(item => ({
            value: item.soilMoisture,
            label: new Date(item.timestamp).toLocaleTimeString().slice(0, 5) // Format time
          }));

          setTemperatureData(formattedTemperatureData);
          setHumidityData(formattedHumidityData);
          setSoilMoistureData(formattedSoilMoistureData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchDataToday();
  }, []);

  useEffect(() => {
    ws.current = new WebSocket('ws://192.168.2.151:8080');

    ws.current.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.current.onmessage = (event) => {
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

    ws.current.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    return () => {
      ws.current.close();
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
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <LineChart
            data={temperatureData}
            width={screenWidth - 20}
            height={200}
            isAnimated
            showVerticalLines={false}
            xAxisLabelStyle={styles.axisLabel}
            yAxisLabelStyle={styles.axisLabel}
            color="#ff5733"
            style={styles.chart}
          />
          <Text style={styles.chartTitle}>Biểu đồ nhiệt độ</Text>

          <LineChart
            data={humidityData}
            width={screenWidth - 20}
            height={200}
            isAnimated
            showVerticalLines={false}
            xAxisLabelStyle={styles.axisLabel}
            yAxisLabelStyle={styles.axisLabel}
            color="#33c1ff"
            style={styles.chart}
          />
          <Text style={styles.chartTitle}>Biểu đồ độ ẩm</Text>

          <LineChart
            data={soilMoistureData}
            width={screenWidth - 20}
            height={200}
            isAnimated
            showVerticalLines={false}
            xAxisLabelStyle={styles.axisLabel}
            yAxisLabelStyle={styles.axisLabel}
            color="#4caf50"
            style={styles.chart}
          />
          <Text style={styles.chartTitle}>Biểu đồ độ ẩm đất</Text>

          <Button title="Close" onPress={onClose} color="#ff0000" />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Semi-transparent background
  },
  modalContainer: {
    width: "100%",
    padding: 10,
    alignItems: "center",
    // Removed fixed height, let ScrollView handle content overflow
  },
  chart: {
    marginVertical: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color: "#333",
  },
  axisLabel: {
    color: "#000",
  },
});

export default ChartModal;
