import React, { useState, useEffect } from 'react';
import { Image, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from './AppContext'; // Giả sử AppContext được định nghĩa sẵn
import AddToPlaylistModal from './AddToPlaylistModal'; // import modal bạn vừa tạo

const LibraryScreen = ({navigation}) => {
  const [favoriteSongs, setFavoriteSongs] = useState([]);
  const { library, setLibrary } = useAppContext();
  const [songs, setSongs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [currentTime, setCurrentTime] = useState('');

  // Lấy danh sách bài hát và nghệ sĩ từ API
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
  }, [library]); // Đảm bảo cập nhật khi context thay đổi

  const toggleFavorite = async (song) => {
  const isFavorite = library.some((s) => s.id === song.id); // Kiểm tra xem bài hát có trong danh sách yêu thích không
  let updatedLibrary;
  let updatedSongs;

  if (isFavorite) {
    // Nếu bài hát đã có trong danh sách yêu thích, xóa nó
    updatedLibrary = library.filter((s) => s.id !== song.id);
    updatedSongs = songs.map((s) =>
      s.id === song.id ? { ...s, isFavorite: false } : s // Cập nhật trạng thái isFavorite
    );
  } else {
    // Nếu bài hát chưa có trong danh sách yêu thích, thêm nó
    updatedLibrary = [...library, song];
    updatedSongs = songs.map((s) =>
      s.id === song.id ? { ...s, isFavorite: true } : s // Cập nhật trạng thái isFavorite
    );
  }

  setLibrary(updatedLibrary); // Cập nhật danh sách yêu thích trong context
  setSongs(updatedSongs); // Cập nhật trạng thái bài hát trong danh sách bài hát

  // Lưu vào AsyncStorage
  try {
    await AsyncStorage.setItem('favoriteSongs', JSON.stringify(updatedLibrary));
  } catch (error) {
    console.error('Lỗi khi lưu bài hát yêu thích:', error);
  }
};



  // Hàm tải danh sách bài hát yêu thích từ AsyncStorage
  useEffect(() => {
    const loadFavoriteSongs = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem('favoriteSongs');
        const parsedFavorites = storedFavorites ? JSON.parse(storedFavorites) : [];
        setFavoriteSongs(Array.isArray(parsedFavorites) ? parsedFavorites : []); // Xử lý dữ liệu
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu từ AsyncStorage:', error);
      }
    };

    loadFavoriteSongs(); // Gọi hàm chỉ một lần
  }, []);

  useEffect(() => {
  const loadLibrary = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favoriteSongs');
      const parsedFavorites = storedFavorites ? JSON.parse(storedFavorites) : [];
      setLibrary(parsedFavorites); // Đồng bộ library với dữ liệu từ AsyncStorage
    } catch (error) {
      console.error('Lỗi khi tải thư viện từ AsyncStorage:', error);
    }
  };

  loadLibrary(); // Tải dữ liệu ngay khi component được mount
}, []);

const openPlaylistModal = (song) => {
    setSelectedSong(song);
    setModalVisible(true);
  };

  const removeFromFavorites = async (songId) => {
    try {
      const updatedLibrary = library.filter((song) => song.id !== songId);
      setLibrary(updatedLibrary); // Cập nhật trạng thái
      await AsyncStorage.setItem('favoriteSongs', JSON.stringify(updatedLibrary)); // Lưu vào AsyncStorage
    } catch (error) {
      console.error('Lỗi khi xóa bài hát yêu thích:', error);
    }
  };

  useEffect(() => {
  const updateTime = () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCurrentTime(formattedTime);
  };
  updateTime();
  const interval = setInterval(updateTime, 60000);
  return () => clearInterval(interval);
}, []);

  const renderSong = ({ item }) => (
  <TouchableOpacity>
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
          {/* Nếu bài hát yêu thích, trái tim màu đỏ, nếu không thì màu xám */}
          <FontAwesome name="heart" size={24} color={item.isFavorite ? 'red' : 'gray'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openPlaylistModal(item)} style={{
          marginRight: 10,
          marginLeft: 10,
        }}>
          <MaterialIcons name="playlist-add" size={24} color="gray" />
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);


  return (
    <View style={styles.container}>
      <View style={styles.row1}>
          <Text style={styles.timeText}>{currentTime}</Text>
      </View>
      <View style={styles.row8}>
          <Text style={{
            marginLeft:20,
            fontWeight:'bold',
            fontSize: 20,
          }}>Thư viện</Text>
      </View>
      <View style={styles.row2}>
          <TouchableOpacity style={styles.butfoot} onPress={() => navigation.navigate('PlaylistScreen')}>
              <FontAwesome name="headphones" size={24} color="gray" />
              <Text>Playlist</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.butfoot} onPress={() => navigation.navigate('AT')}>
              <FontAwesome name="user" size={24} color="gray" />
              <Text>Ca Sĩ</Text>
          </TouchableOpacity >
      </View>
      <View style={styles.chuaDSYeuThich}> 
            <Text style={styles.text2}>Danh sách bài hát yêu thích</Text>

            
        {library.length > 0 ? (
          <FlatList
            data={library}
            renderItem={renderSong}  // Sử dụng hàm renderSong để hiển thị từng bài hát
            keyExtractor={(item) => item.id.toString()}
          />
          ) : (
            <Text style={styles.emptyText}>Không có bài hát yêu thích.</Text>
          )}
          <AddToPlaylistModal
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            selectedSong={selectedSong}
          />
      </View>
    </View>
  );
};



const styles = StyleSheet.create({
    emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  row1: {
    marginTop:10,
    left: 10,
    zIndex: 1,
  },
  timeText: {
    fontSize: 15,
    color: 'black',
  },
  row8:{
    margin:10,
    flexDirection:'row',
  },
  chuaDSYeuThich:{
    padding:10,
  },  
  text2:{
    fontWeight:"bold",
    fontSize:15,
  },
  row2:{
    marginTop:5,
    width:'100%',
    height:50,
    flexDirection:'row',
  },
    butfoot:{
    padding:20,
    justifyContent:'center',
    alignItems:'center',
  },
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
    backgroundColor: '#ecf0f1',
    padding: 8,
  }
});

export default LibraryScreen;
