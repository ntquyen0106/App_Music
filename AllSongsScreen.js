import React, { useState, useEffect } from 'react';
import {ScrollView, Image, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from './AppContext'; // Giả sử AppContext được định nghĩa sẵn
import AddToPlaylistModal from './AddToPlaylistModal'; // import modal bạn vừa tạo

export default function AllSongsScreen({ route }) {
  const { chart } = route.params; // Nhận dữ liệu từ navigation
  const { library, setLibrary, playlists, setPlaylists } = useAppContext();
  const [songs, setSongs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [artists, setArtists] = useState([]);
  const {followedArtists, setFollowedArtists} = useAppContext();

  useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('https://671a3dbbacf9aa94f6a9ccd8.mockapi.io/song');
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const updatedSongs = data[0].songs.map((song) => ({
          ...song,
          isFavorite: library.some((item) => item.id === song.id),
        }));
        setSongs(updatedSongs);

        const updatedArtists = data[0].artists.map((artist) => ({
          ...artist,
          isFollowed: followedArtists.some((item) => item.id === artist.id),
        }));
        setArtists(updatedArtists);
      }
    } catch (error) {
      console.error('Lỗi khi fetch dữ liệu:', error);
    }
  };

  fetchData();
  }, [library, followedArtists]); // Đảm bảo cập nhật khi context thay đổi

    const toggleFollowArtist = async (artist) => {
      const isFollowed = followedArtists.some((s) => s.id === artist.id);
      let updatedFollowedArtists;
      
      if (isFollowed) {
        updatedFollowedArtists = followedArtists.filter((s) => s.id !== artist.id);
      } else {
        updatedFollowedArtists = [...followedArtists, artist];
      }

      setFollowedArtists(updatedFollowedArtists);
      
      // Lưu vào AsyncStorage
      try {
        await AsyncStorage.setItem('followedArtists', JSON.stringify(updatedFollowedArtists));
      } catch (error) {
        console.error('Lỗi khi lưu nghệ sĩ theo dõi:', error);
      }
    };

  
  const toggleFavorite = async (song) => {
  const isFavorite = library.some((s) => s.id === song.id);
  let updatedLibrary;
  let updatedSongs;

  if (isFavorite) {
    updatedLibrary = library.filter((s) => s.id !== song.id);
    updatedSongs = songs.map((s) =>
      s.id === song.id ? { ...s, isFavorite: false } : s
    );
  } else {
    updatedLibrary = [...library, song];
    updatedSongs = songs.map((s) =>
      s.id === song.id ? { ...s, isFavorite: true } : s
    );
  }

  setLibrary(updatedLibrary);
  setSongs(updatedSongs);

  // Lưu vào AsyncStorage
  try {
    await AsyncStorage.setItem('favoriteSongs', JSON.stringify(updatedLibrary));
  } catch (error) {
    console.error('Lỗi khi lưu bài hát yêu thích:', error);
  }
};
  // Hiển thị danh sách bài hát
  const renderSongItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('PN', item)}>
        <View style={styles.songItem}>
          <Image source={{ uri: item.anh }} style={styles.songImg} />
          <View style={styles.songDetails}>
            <Text style={styles.songTitle}>{item.tenBaiHat}</Text>
            <Text>{item.caSi}</Text>
            <View style={styles.row4}>
              <FontAwesome name="play" size={10} color="gray" />
              <Text style={styles.text1}>{item.luotNghe}</Text>
              <FontAwesome style={styles.text1} name="circle" size={5} color="black" />
              <Text style={styles.text1}>{item.thoiGian}</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => toggleFavorite(item)}
            >
              <FontAwesome name="heart" size={24} color={item.isFavorite ? 'red' : 'gray'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openPlaylistModal(item)} style={{
              marginRight:10,
              marginLeft:10,
            }}>
              <MaterialIcons name="playlist-add" size={24} color="gray" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
  );

  const openPlaylistModal = (song) => {
    setSelectedSong(song);
    setModalVisible(true);
  };


  return (
    <View style={styles.container}>
  <Text style={styles.title}>Top Chart in {chart.tuaDe}</Text>
    <FlatList
      data={songs}
      renderItem={renderSongItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
    <AddToPlaylistModal
      modalVisible={modalVisible}
      setModalVisible={setModalVisible}
      selectedSong={selectedSong}
    />
  </View>

    );
  }
const styles = StyleSheet.create({
  row4: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text1: {
    fontSize: 12,
    color: 'gray',
    marginLeft: 5,
  },
songItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  songImg: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  songDetails: {
    flex: 1,
    marginLeft: 10,
  },
  songTitle: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  songImg: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  songTitle: {
    fontSize: 16,
  },
  artistName: {
    fontSize: 14,
    color: 'gray',
  },
});
