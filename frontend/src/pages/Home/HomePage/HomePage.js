  import React, { useEffect, useState } from "react";
  import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
  } from "react-native";
  import { styles } from "../../../Style/HomeStyle";
  import Header from "../../../components/Header/Header";
  import ThresholdEditor from "../../../components/ThresholdEditor/ThresholdEditor";
  import ChartModal from "../../../components/Modal/Chart/ChartModal";

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
  
      // Send pump control command to WebSocket server
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
        <View style={styles.infoBox}>
          <View style={styles.column}>
            <Text style={styles.infoLabel}>Nhiệt độ:</Text>
            <Text style={styles.infoValue}>{temperature} °C</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.column}>
            <Text style={styles.infoLabel}>Độ ẩm:</Text>
            <Text style={styles.infoValue}>{humidity} %</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.column}>
            <Text style={styles.infoLabel}>Độ ẩm đất:</Text>
            <Text style={styles.infoValue}>{soilMoisture} %</Text>
          </View>
        </View>
        <TouchableOpacity style={localStyles.button} onPress={showModal}>
          <Text style={localStyles.buttonText}>Xem biểu đồ</Text>
        </TouchableOpacity>
        <View style={localStyles.footer}>
          <View style={localStyles.switchContainer}>
            <Text style={localStyles.switchLabel}>Bật/tắt máy bơm:</Text>
            <Switch
              value={isPumpOn}
              onValueChange={togglePump}
              trackColor={{ false: "#d1d1d1", true: "#81c743" }}
              thumbColor={isPumpOn ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>
        <ThresholdEditor />
        <ChartModal isVisible={isModalVisible} onClose={hideModal} />
      </SafeAreaView>
    );
  }

  const localStyles = StyleSheet.create({
    infoBox: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginVertical: 20,
      paddingHorizontal: 10,
      backgroundColor: "#f0f4f8", // Light background color
      borderRadius: 10,
      padding: 15,
    },
    column: {
      flex: 1,
      alignItems: "center",
    },
    divider: {
      width: 1,
      height: "100%",
      backgroundColor: "#dcdcdc", // Light gray color for divider
      marginHorizontal: 10,
    },
    infoLabel: {
      fontSize: 16,
      color: "#333", // Dark gray for labels
      fontWeight: "bold",
    },
    infoValue: {
      fontSize: 18,
      color: "#000", // Black for values
      fontWeight: "bold",
    },
    button: {
      backgroundColor: "#2196F3", // Blue color for button
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      width: 180,
      alignSelf: "center",
      marginVertical: 10,
      elevation: 4, // Shadow for Android
    },
    buttonText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "bold",
      textAlign: "center",
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 15,
      marginHorizontal: 10,
      marginTop: 20,
    },
    switchContainer: {
      flexDirection: "row",
      width: "100%",
      alignItems: "center",
      justifyContent: "space-between",
    },
    switchLabel: {
      fontSize: 16,
      marginRight: 10,
      color: "#333",
    },
  });
