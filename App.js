import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';


export default class App extends React.Component {
  state = {
    hasCameraPermission: null,
    isRecording: false,
    latitude: null,
    longitude: null,
    altitude: null,
    showLocationContainer: false, 
  };

  cameraRef = null;
  accelerometerSubscription = null;

  async componentDidMount() {
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } = await MediaLibrary.requestPermissionsAsync();
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

    await Accelerometer.setUpdateInterval(1000);

    this.setState({
      hasCameraPermission: cameraStatus === 'granted' && mediaLibraryStatus === 'granted',
    });

    if (locationStatus === 'granted') {
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 100,
          distanceInterval: 1000,
        },
        (location) => {
          const { latitude, longitude, altitude } = location.coords;
          this.setState({ latitude, longitude, altitude });
        }
      );
    }

    this.accelerometerSubscription = Accelerometer.addListener(this.handleAccelerometerData);
  }

  handleAccelerometerData = (accelerometerData) => {
    const { x, y, z } = accelerometerData;
    this.setState({ latitude: x, longitude: y, altitude: z });
  };

  handleRecordVideo = async () => {
    const { isRecording } = this.state;

    if (this.cameraRef && !isRecording) {
      try {
        this.setState({ isRecording: true });
        const video = await this.cameraRef.recordAsync();

        const captureDate = new Date();
        const year = captureDate.getFullYear();
        const month = String(captureDate.getMonth() + 1).padStart(2, '0');
        const day = String(captureDate.getDate()).padStart(2, '0');
        const hour = String(captureDate.getHours()).padStart(2, '0');
        const minute = String(captureDate.getMinutes()).padStart(2, '0');
        const second = String(captureDate.getSeconds()).padStart(2, '0');
        const fileName = `${year}-${month}-${day}_${hour}-${minute}-${second}_VID.mp4`;

        const dirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'Camera');
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'Camera');
        }

        const newFilePath = `${FileSystem.documentDirectory}Camera/${fileName}`;
        await FileSystem.moveAsync({
          from: video.uri,
          to: newFilePath,
        });

        await MediaLibrary.saveToLibraryAsync(newFilePath);
        console.log('Video recorded and saved:', newFilePath);

        this.setState({ showLocationContainer: true });
      } catch (error) {
        console.error('Error recording video:', error);
      } finally {
        this.setState({ isRecording: false });
      }
    } else {
      console.log('Another recording is already in progress.');
    }
  };
  handleFetchLocation = () => {
    this.setState({ showLocationContainer: true });
  };
  handlehideLocation = () => {
    this.setState({ showLocationContainer: false });
  };
  handleStopRecording = () => {
    if (this.cameraRef && this.state.isRecording) {
      this.cameraRef.stopRecording();
      this.setState({ isRecording: false });
    }
  };

  setCameraRef = (ref) => {
    this.cameraRef = ref;
  };

  componentWillUnmount() {
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
    }
  }

  render() {
    const { hasCameraPermission, isRecording, latitude, longitude, altitude, showLocationContainer } = this.state;

    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      const truncatedLatitude = latitude !== null ? latitude.toFixed(5) : null;
      const truncatedLongitude = longitude !== null ? longitude.toFixed(5) : null;
      const truncatedAltitude = altitude !== null ? altitude.toFixed(5) : null;

      return (
        <View style={styles.container}>
          <Camera style={styles.camera} type={Camera.Constants.Type.back} ref={this.setCameraRef} />
         
         
          <TouchableOpacity style={styles.button} onPress={this.handleRecordVideo} disabled={isRecording}>
            <Text style={styles.buttonText}>Record video</Text>

          </TouchableOpacity>
          {isRecording && (
            <TouchableOpacity style={styles.button} onPress={this.handleStopRecording}>
              <Text style={styles.buttonText}>Stop recording</Text>
            </TouchableOpacity>
          )}
         <TouchableOpacity style={styles.button1} onPress={this.handleFetchLocation}>
              <Text style={styles.buttonText}>Fetch location</Text>
            </TouchableOpacity>
            
             { showLocationContainer &&(
            <TouchableOpacity style={styles.button1} onPress={this.handlehideLocation}>
              <Text style={styles.buttonText}>hide location</Text>
            </TouchableOpacity>
            )}
          {showLocationContainer && (
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>Latitude: {truncatedLatitude}</Text>
              <Text style={styles.locationText}>Longitude: {truncatedLongitude}</Text>
              <Text style={styles.locationText}>Altitude: {truncatedAltitude}</Text>
            </View>
          )}
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  camera: {
    flex: 1,
  },
  button: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'flex-start',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginTop: 16,
  },
  button1: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'flex-end',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationContainer: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginTop: 16,
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
