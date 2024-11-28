import React, { useState, useEffect } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

const PhatNhac = ({ route, navigation }) => {
  const { tenBaiHat, caSi, anh, thoiGian, url, id } = route.params || {};
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [allSongs, setAllSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const spinValue = new Animated.Value(0);

  useEffect(() => {
    fetch('https://671a3dbbacf9aa94f6a9ccd8.mockapi.io/song')
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAllSongs(data[0].songs);
          const index = data[0].songs.findIndex(song => song.id === id);
          setCurrentSongIndex(index !== -1 ? index : 0);
        }
      })
      .catch((error) => console.error(error));
  }, [id]);

  useEffect(() => {
    if (currentSongIndex !== null) {
      loadAndPlayAudio();
    }
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [currentSongIndex]);
  
  // Dừng nhạc khi màn hình không còn tập trung
  useFocusEffect(
    React.useCallback(() => {
      // Khi màn hình được focus
      return () => {
        // Khi màn hình mất focus
        if (sound) {
          sound.stopAsync();
          sound.unloadAsync();
          setIsPlaying(false);
        }
      };
    }, [sound])
  );

  const startSpinAnimation = () => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopSpinAnimation = () => {
    spinValue.stopAnimation();
  };

  const loadAndPlayAudio = async () => {
    if (sound) {
      await sound.unloadAsync();
    }

    if (allSongs[currentSongIndex]) {
      const currentSong = allSongs[currentSongIndex];
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: currentSong.url },
          { shouldPlay: true }
        );

        setSound(newSound);
        setIsPlaying(true);
        startSpinAnimation();

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setProgress(status.positionMillis / status.durationMillis || 0);
            setDuration(status.durationMillis || 0);

            if (status.didJustFinish) {
              nextSong();
            }
          }
        });
      } catch (error) {
        console.error("Error loading audio:", error);
      }
    }
  };

  const playPauseAudio = async () => {
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
        stopSpinAnimation();
      } else {
        await sound.playAsync();
        setIsPlaying(true);
        startSpinAnimation();
      }
    } else {
      loadAndPlayAudio();
    }
  };

  const nextSong = async () => {
    if (currentSongIndex !== null && allSongs.length > 0) {
      setCurrentSongIndex((currentSongIndex + 1) % allSongs.length);
    }
  };

  const previousSong = async () => {
    if (currentSongIndex !== null && allSongs.length > 0) {
      setCurrentSongIndex((currentSongIndex - 1 + allSongs.length) % allSongs.length);
    }
  };

  const seekBackward = async () => {
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        await sound.setPositionAsync(Math.max(0, status.positionMillis - 10000));
      }
    }
  };

  const seekForward = async () => {
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        await sound.setPositionAsync(Math.min(status.durationMillis, status.positionMillis + 10000));
      }
    }
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient colors={['#4A00E0', '#8E2DE2']} style={styles.container}>
      <TouchableOpacity onPress={playPauseAudio}>
        <Animated.Image
          source={{ uri: allSongs[currentSongIndex]?.anh || anh }}
          style={[styles.songImg, { transform: [{ rotate: isPlaying ? spin : '0deg' }] }]}
        />
      </TouchableOpacity>

      <Text style={styles.songTitle}>{allSongs[currentSongIndex]?.tenBaiHat || tenBaiHat}</Text>
      <Text style={styles.artistName}>{allSongs[currentSongIndex]?.caSi || caSi}</Text>

      <View style={styles.progressContainer}>
        <Text style={styles.durationText}>
          {Math.floor((progress * duration) / 1000 / 60)}:
          {Math.floor(((progress * duration) / 1000) % 60).toString().padStart(2, '0')}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.durationText}>{Math.floor(duration / 1000 / 60)}:{(Math.floor(duration / 1000) % 60).toString().padStart(2, '0')}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.smallControl} onPress={seekBackward}>
          <View style={styles.seekButton}>
            <FontAwesome name="rotate-left" size={18} color="#fff" />
            <Text style={styles.seekText}>10</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={previousSong}>
          <FontAwesome name="step-backward" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, styles.playPauseButton]}
          onPress={playPauseAudio}
        >
          <FontAwesome name={isPlaying ? 'pause' : 'play'} size={30} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={nextSong}>
          <FontAwesome name="step-forward" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallControl} onPress={seekForward}>
          <View style={styles.seekButton}>
            <FontAwesome name="rotate-right" size={18} color="#fff" />
            <Text style={styles.seekText}>10</Text>
          </View>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    padding: 20,
  },
  songImg: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 10,
    borderColor: '#fff',
  },
  songTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
  },
  artistName: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 5,
    backgroundColor: '#ddd',
    marginHorizontal: 10,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#fff',
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  controlButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8E2DE2',
    borderRadius: 40,
    width: 60,
    height: 60,
    marginHorizontal: 10,
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A00E0',
  },
  smallControl: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A00E0',
    borderRadius: 25,
    width: 50,
    height: 50,
  },
  seekButton: {
    alignItems: 'center',
  },
  seekText: {
    color: '#fff',
    fontSize: 10,
    marginTop: 2,
  },
});

export default PhatNhac;








