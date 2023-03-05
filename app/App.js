import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';

// BLOB COMPONENTS
import { Svg, Circle, Defs, Mask, RadialGradient, Stop, Rect, Path} from 'react-native-svg';
import SvgComponent from './blob';

import { Entypo } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import * as React from 'react';
import { useEffect } from 'react';
import * as FileSystem from 'expo-file-system';

export default function App() {
  const [recording, setRecording] = React.useState();

  const particleWorld = [];
  const velocityDecay = 0.01;
  const particleLifetime = 1000.0;
  let fftAvgWin = 0;

  useEffect(() => {
    const soundAllowed = async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Microphone permission not granted');
        }
        const audioContent = new AudioContext();
        const audioStream = await Audio.getAudioModeAsync();
        const analyser = audioContent.createAnalyser();
        audioStream.setAnalyser(analyser);
        analyser.fftSize = 1024;

        const frequencyArray = new Uint8Array(analyser.frequencyBinCount);

        // we have 5 circles in our particle system
        const circleCount = 4;
        for (let i = 1; i <= circleCount; i++) {
          const initialRadius = circleCount / i;
          particleWorld.push({
            particleId: i,
            alive: true,
            acceleration: i / circleCount,
            velocity: i / circleCount,
            radius: initialRadius,
            birth: new Date().getTime() - i * 100,
          });
        }

        const doDraw = () => {
          requestAnimationFrame(doDraw);
          analyser.getByteFrequencyData(frequencyArray);
          const fftAvg =
            frequencyArray.reduce((fftv, t) => fftv + t) / 255;
          fftAvgWin = (fftAvgWin + fftAvg) / 2;
          const radius = fftAvgWin / 20;
          particleWorld.forEach((particle, index) => {
            const now = new Date().getTime();
            if (particle.alive) {
              if (particle.radius > 50) {
                particle.alive = false;
              }
              if (particle.birth < now - particleLifetime) {
                particle.alive = false;
              }
            } else {
              particle.velocity = Math.min(radius, 0.9);
              particle.radius = 0;
              particle.alive = true;
              particle.birth = new Date().getTime() - index * 100; // to maintain randomness
            }
            particle.velocity -= velocityDecay;
            particle.radius += particle.velocity;
          });
        };
        doDraw();
      } catch (error) {
        console.log(error);
      }
    };
    soundAllowed();
  }, []);
  
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

  async function playFinal() {
    const soundObject = new Audio.Sound();
    try {
      console.log(`\n ------- trying  ------- \n`);

      await soundObject.loadAsync({ uri: "abc.mp3" });

      console.log(`\n ------- playing...  ------- \n`);

      await soundObject.playAsync();
      console.log('Playing audio..');
    } catch (error) {
      console.log('Error playing audio: ', error);
    }
    console.log('Finished audio..');

    return "bob"
  }

  async function playRecordedAudio() {
    console.log('\n ------- Fetching recorded audio... ------- \n');
    const apiUrl = 'http://127.0.0.1:5000/pipeline';

    const audioFile = recordedAudio; // replace with uri path
    console.log(`\n ------- making form  ------- \n`);
    // Create a new FormData object
    const formData = new FormData();
    formData.append('file', {
      uri: audioFile,
      type: 'audio/mp4',
      name: 'audio.m4a'
    });

    console.log(`\n ------- fetching data  ------- \n`);

    const result = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then( async response => {
      const soundObject = new Audio.Sound();

      try {
      console.log('*%*59898#@$$#@');
      const fileInfo = await FileSystem.getInfoAsync("/Users/kevinbuhler/Code/audiogpt/api/abc.mp3");
      console.log('*****',fileInfo)
      if (fileInfo.exists) {
        await soundObject.loadAsync({ uri: fileInfo.uri });
        await soundObject.playAsync();
        console.log('Playing audio...');
      } else {
        console.log(`File not found: ${filePath}`);
      }

      } catch (error) {
        console.log('Error playing audio: ', error);
      }
      console.log('Stopped recording...');
      
      console.log('\n ------- DONE! ------- \n');
      
    })
    
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.uwotm8}>
        <Text>AUDIOxGPT</Text>
      </View>
      
      {/* PLAY AUDIO */}
      

      {/* SETTINGS BUTTON */}
      <View style={styles.settings}>
        <Ionicons name="settings-outline" size={36} color="white" style={styles.settingsIcon}/>
      </View>

      {/* MMMMM BLOB */}
      {/* WILL LIKELY DO THIS VIA JS AND CSS */}
      <View style={styles.blob}>
        <Text>This is blob.</Text>
        {/* BLOB COMP */}
        <SvgComponent />
        <View>
          <Text>You must allow microphone permissions for this app to work.</Text>
          <Svg height="100%" width="100%">
            {particleWorld.map((particle, index) => (
              <Circle
                key={index}
                cx="50"
                cy="50"
                r={particle.radius}
                stroke="white"
                strokeWidth="1"
                fill="none"
                strokeOpacity={1 - Math.abs(particle.birth - new Date().getTime()) / 1000}
              />
            ))}
          </Svg>
        </View>
        
      </View>
  
      {/* RECORD BUTTON */}
      {/* <View style={styles.buttonCustom}>
        <Image source={'/assets/button.png'}/> 
      </View> */}

      {/* SECOND BUTTON AS WELL??? */}
      <View style={styles.buttonRecord}>
        {/* <Button
          title={recording ? 'Stop Recording' : 'Start Recording'}
          onPress={recording ? stopRecording : startRecording}
        /> */}

        <TouchableOpacity 
          title={recording ? 'Stop Recording' : 'Start Recording'}
          onPress={recording ? stopRecording : startRecording}>  

          {/* START RECORDING BUTTON */}
          {/* <MaterialCommunityIcons name="record-rec" size={80} color="white" /> */}
          <Entypo name="circle" size={56} color="white" />
        </TouchableOpacity>

        {/* STOP RECORDING BUTTON */}
        {/* <Ionicons name="md-stop-circle-outline" size={72} color="white" /> */}

        {/* PLAY RECORDED AUDIO */}
        {recordedAudio && (
        <TouchableOpacity title="Play Recorded Audio" onPress={playRecordedAudio}>
          <Entypo name="controller-play" size={72} color="white" />
        </TouchableOpacity>
         )}

      </View>
    
      

        

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uwotm8: {
    flex: 1,
    color: 'white',
    justifyContent: 'center',
  },
  settings: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: '#10041E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    alignSelf: 'flex-end',
    padding: 20,
  },

  blob: {
    alignSelf: 'stretch',
    flex: 5,
    backgroundColor: '#2e0b56',
    alignItems: 'center',
    justifyContent: 'center',
  },

  SvgComponent:{
    backgroundColor: '#000000',
    display: 'block',
    width: 400,
    height: 400,
    padding: 0,
    margin: 0,
  },

  buttonRecord: {
    alignSelf: 'stretch',
    flex: 2,
    backgroundColor: '#10041E',
    alignItems: 'center',
    justifyContent: 'center',
  },
});



