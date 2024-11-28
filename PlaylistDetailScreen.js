
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from './AppContext'; // Giả sử bạn đang sử dụng AppContext để quản lý playlists
import React, { useState, useEffect } from 'react';
import { Image, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AddToPlaylistModal from './AddToPlaylistModal'; // import modal bạn vừa tạo

const PlaylistDetailScreen = () => {
  const route = useRoute();
  const { playlist } = route.params;
  const { library, setLibrary, playlists, setPlaylists } = useAppContext();
  const [songs, setSongs] = useState(playlist.songs); // Sử dụng state songs để quản lý danh sách bài hát hiển thị
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  
  const toggleFavorite = async (song) => {
    const isFavorite = library.some((s) => s.id === song.id);
    let updatedLibrary;

    // Cập nhật trạng thái yêu thích trong thư viện
    if (isFavorite) {
      updatedLibrary = library.filter((s) => s.id !== song.id);
    } else {
      updatedLibrary = [...library, song];
    }
    setLibrary(updatedLibrary);

    // Cập nhật trạng thái trong `songs`
    const updatedSongs = songs.map((s) =>
      s.id === song.id ? { ...s, isFavorite: !isFavorite } : s
    );
    setSongs(updatedSongs);

    // Cập nhật trạng thái trong `playlist.songs`
    playlist.songs = updatedSongs;
    const updatedPlaylists = playlists.map((p) =>
      p.name === playlist.name ? playlist : p
    );
    setPlaylists(updatedPlaylists);

    // Lưu vào AsyncStorage
    try {
      await AsyncStorage.setItem('favoriteSongs', JSON.stringify(updatedLibrary));
      await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
    } catch (error) {
      console.error('Lỗi khi lưu bài hát yêu thích:', error);
    }
  };

  const deleteSong = async (songIndex) => {
    const updatedSongs = songs.filter((_, index) => index !== songIndex); // Lọc bỏ bài hát tại vị trí songIndex
    setSongs(updatedSongs); // Cập nhật lại state songs để phản ánh sự thay đổi ngay lập tức

    playlist.songs = updatedSongs; // Cập nhật lại playlist hiện tại
    const updatedPlaylists = playlists.map((p) =>
      p.name === playlist.name ? playlist : p
    ); // Cập nhật danh sách playlists
    setPlaylists(updatedPlaylists); // Đảm bảo cập nhật lại state playlists

    // Lưu vào AsyncStorage
    try {
      await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
    } catch (error) {
      console.error('Lỗi khi lưu playlists:', error);
    }
  };

  // Kiểm tra nếu playlist không có bài hát hợp lệ
  if (!playlist || !songs || !Array.isArray(songs) || songs.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{playlist?.name || 'Playlist không hợp lệ'}</Text>
        <Text>Playlist hiện không có bài hát.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{playlist.name}</Text>
      <FlatList
        data={songs} // Sử dụng state songs
        renderItem={({ item, index }) => (
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
              <TouchableOpacity onPress={() => toggleFavorite(item)}>
                <FontAwesome
                  name="heart"
                  size={24}
                  color={item.isFavorite ? 'red' : 'gray'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => openPlaylistModal(item)}
                style={{
                  marginRight: 10,
                  marginLeft: 10,
                }}
              >
                <MaterialIcons name="playlist-add" size={24} color="gray" />
              </TouchableOpacity>
              {/* Nút xóa bài hát */}
              <TouchableOpacity onPress={() => deleteSong(index)}>
                <MaterialIcons name="delete" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item, index) => `${item.id}-${index}`}
      />
      <AddToPlaylistModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        selectedSong={selectedSong}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  text1: {
    fontSize: 12,
    color: 'gray',
    marginLeft: 5,
  },
  row4: {
    flexDirection: 'row',
    alignItems: 'center',
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
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  songItem: { paddingVertical: 10, borderBottomWidth: 1, borderColor: '#ccc', flexDirection: 'row', justifyContent: 'space-between' },
  deleteButton: { backgroundColor: 'red', padding: 8, borderRadius: 4 },
  deleteButtonText: { color: 'white' },
});

export default PlaylistDetailScreen;
