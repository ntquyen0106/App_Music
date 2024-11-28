import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from './AppContext';

const PlaylistScreen = ({ navigation }) => {
  const { playlists, setPlaylists } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  // Lưu playlist vào AsyncStorage
  const savePlaylists = async (playlists) => {
  try {
    await AsyncStorage.setItem('playlists', JSON.stringify(playlists));
  } catch (error) {
    console.error('Lỗi khi lưu playlist:', error);
  }
};

const addPlaylist = async () => {
  if (newPlaylistName.trim()) {
    const isDuplicate = playlists.some(
      (playlist) => playlist.name.toLowerCase() === newPlaylistName.trim().toLowerCase()
    );
    if (isDuplicate) {
      alert('Playlist này đã tồn tại!');
      return;
    }

    const newPlaylist = { name: newPlaylistName.trim(), songs: [] };
    const updatedPlaylists = [...playlists, newPlaylist];

    // Cập nhật state và lưu vào AsyncStorage
    setPlaylists(updatedPlaylists);
    await savePlaylists(updatedPlaylists);

    setNewPlaylistName('');
    setModalVisible(false);
  }
};


useEffect(() => {
  const syncPlaylists = async () => {
    try {
      const storedPlaylists = await AsyncStorage.getItem('playlists');
      if (storedPlaylists) {
        setPlaylists(JSON.parse(storedPlaylists));
      } else {
        setPlaylists([]); // Giá trị mặc định là mảng rỗng
      }
    } catch (error) {
      console.error('Lỗi khi đồng bộ playlist:', error);
    }
  };

  syncPlaylists();
}, []);



  // Chuyển hướng sang màn PlaylistDetail
  const goToPlaylistDetail = (playlist) => {
    navigation.navigate('PlaylistDetail', { playlist }); // Dùng navigation.navigate để chuyển màn hình
  };

  const loadPlaylists = async () => {
  try {
    const storedPlaylists = await AsyncStorage.getItem('playlists');
    if (storedPlaylists) {
      setPlaylists(JSON.parse(storedPlaylists));
    } else {
      setPlaylists([]); // Nếu không có, tạo mảng rỗng mặc định
    }
  } catch (error) {
    console.error('Lỗi khi tải playlist:', error);
  }
};

useEffect(() => {
  loadPlaylists(); // Tải playlist khi ứng dụng chạy
}, []);

  

  // Hàm xóa playlist
  const deletePlaylist = (playlistName) => {
    const updatedPlaylists = playlists.filter((playlist) => playlist.name !== playlistName);
    setPlaylists(updatedPlaylists);
    savePlaylists(updatedPlaylists); // Lưu vào AsyncStorage
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Playlists</Text>

      <FlatList
        data={playlists}
        renderItem={({ item }) => (
          <View style={styles.playlistItem}>
            <TouchableOpacity onPress={() => goToPlaylistDetail(item)}>
              <Text style={styles.playlistName}>{item.name}</Text>
              <Text>Số bài hát: {item.songs.length}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deletePlaylist(item.name)} style={styles.deleteButton}>
              <Text style={styles.deleteText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Tạo Playlist</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tạo Playlist Mới</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Nhập tên playlist"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={addPlaylist}>
                <Text>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
    </View>
    
  );
};

const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  playlistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  playlistName: {
    fontSize: 18,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff6347',
    padding: 5,
    borderRadius: 5,
  },
  deleteText: {
    color: '#fff',
  },
  addButton: {
    padding: 10,
    backgroundColor: '#4caf50',
    marginTop: 20,
    alignItems: 'center',
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    width: '80%',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
  },
  saveButton: {
    padding: 10,
    backgroundColor: '#4caf50',
    borderRadius: 5,
  },
});

export default PlaylistScreen;
