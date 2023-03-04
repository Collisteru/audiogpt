import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import { Audio } from 'expo-av';

import * as React from 'react';

export default function App() {
  const [recording, setRecording] = React.useState();

  async function startRecording() {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync( Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();
    console.log('Recording stopped and stored at', uri);
    setRecordedAudio(uri);
  }

  const [recordedAudio, setRecordedAudio] = React.useState();

  async function playRecordedAudio() {
    console.log('Playing recorded audio..');
    const soundObject = new Audio.Sound();
    try {
      await soundObject.loadAsync({ uri: recordedAudio });
      await soundObject.playAsync();
      console.log('Playing audio..');
    } catch (error) {
      console.log('Error playing audio: ', error);
    }
  }

  return (
    <View style={styles.textStyle}>
      <View style={styles.container}>
        <Text style={styles.textInput} placeholder>AUDIOxGPT, the voice assistant who actually knows the answer!</Text>
        <Button title="Start your journey"/>
      </View>
      
      <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? stopRecording : startRecording}
      />
      {recordedAudio && (
        <Button title="Play Recorded Audio" onPress={playRecordedAudio} />
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  textStyle: {
    borderWidth: 5, borderColor: '#202003', marginTop: 45, padding: 10,
  },
  textInput: {
    borderWidth: 3,
    borderColor: '#C0C20A',
    width: '100%',
    marginLeft: 1,
    marginRight: 1,
    fontSize: 20
  }
});