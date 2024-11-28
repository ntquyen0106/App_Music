import React, { useState, useEffect } from 'react';
import { FlatList, TextInput, TouchableOpacity, SafeAreaView, View, Text, StyleSheet, Image, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from './AppContext'; // Giả sử AppContext được định nghĩa sẵn
import AddToPlaylistModal from './AddToPlaylistModal'; // import modal bạn vừa tạo

export default function AlbumScreen({ route, navigation }) {
  const { album, songs } = route.params;
  const { library, setLibrary} = useAppContext();
  const [, setSongs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('https://671a3dbbacf9aa94f6a9ccd8.mockapi.io/song');
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        // Lọc bài hát theo tên album từ tham số route
        const filteredSongs = data[0].songs.filter((song) => song.tenAlbum === album.tenAlbum);
        
        // Cập nhật lại bài hát với thông tin yêu thích
        const updatedSongs = filteredSongs.map((song) => ({
          ...song,
          isFavorite: library.some((item) => item.id === song.id),
        }));

        setSongs(updatedSongs); // Cập nhật danh sách bài hát
      }
    } catch (error) {
      console.error('Lỗi khi fetch dữ liệu:', error);
    }
  };

  fetchData();
}, [album, library]); // Lắng nghe album và library để cập nhật khi thay đổi


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
    <TouchableOpacity onPress={() => navigation.navigate('PN', item)} >
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

  
  return (
    <View style={styles.container}>
      <View style={{
        flexDirection:'row',
      }}>
            <View>
                  <Text style={styles.title}><Text style={styles.title}>Album:</Text>{album.tenAlbum}</Text>
                  <Text style={styles.artist}>Ca sĩ: {album.caSi}</Text>
            </View>
      </View>
      {songs.length > 0 ? (
        <FlatList
          data={songs}
          renderItem={renderSongItem}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <Text style={styles.noSongsText}>Không có bài hát nào cho album này.</Text>
      )}

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
  but:{
      marginLeft:10,
      marginRight:10,
      flexDirection:'row',
      top:10,
      color:'black',
    },
  container: { flex: 1, padding: 10 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 ,
        marginRight:5,
  },
  artist: { fontSize: 16, marginBottom: 20 },
  songItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  songImg: { width: 50, height: 50, marginRight: 10 },
  songTitle: { fontSize: 16 },
});
