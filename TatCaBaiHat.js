import React, { useState, useEffect } from 'react';
import { Image, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useAppContext } from './AppContext'; // Giả sử AppContext được định nghĩa sẵn
import AddToPlaylistModal from './AddToPlaylistModal'; // import modal bạn vừa tạo


const AllContent = () => {
  const { library, setLibrary, playlists, setPlaylists } = useAppContext();
  const [songs, setSongs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [artists, setArtists] = useState([]);
  const {followedArtists, setFollowedArtists} = useAppContext();

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



  // Hiển thị danh sách nghệ sĩ
  const renderArtistItem = ({ item }) => (
  <TouchableOpacity>
      <View style={styles.item}>
    <View style={{ flexDirection: 'row' }}>
      <Image source={{ uri: item.anh }} style={styles.artImg} />
      <View>
        <Text style={styles.nameartist}>{item.name}</Text>
        <View style={{ flexDirection: 'row' }}>
          <FontAwesome style={styles.icon} name="users" size={15} color="gray" />
          <Text style={styles.fl}>{item.follow}</Text>
        </View>
      </View>
    </View>
    <View>
      <TouchableOpacity 
        style={styles.followButton}
        onPress={() => toggleFollowArtist(item)} // Hàm này sẽ thay thế thao tác follow/unfollow
      >
        <Text style={styles.followText}>
          {followedArtists.some((s) => s.id === item.id) ? 'Unfollow' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </View>
    </View>
  </TouchableOpacity>

);
  // Hiển thị danh sách bài hát
  const renderSongItem = ({ item }) => (
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
      <Text style={styles.header}>Danh sách bài hát</Text>
      <FlatList data={songs} renderItem={renderSongItem} keyExtractor={(item) => item.id.toString()} />
      <Text style={styles.header}>Danh sách nghệ sĩ</Text>
      <FlatList data={artists} renderItem={renderArtistItem} keyExtractor={(item) => item.id.toString()} />
      <AddToPlaylistModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        selectedSong={selectedSong}
      />

    </View>
  );
};
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
  artItem: {
    padding:10,
    justifyContent:'space-between',
    flexDirection:'row',
    alignItems:'center',
    width: 320,
    height: 60 ,
    marginRight: 15,
  },
  artImg: {
    margin:5,
    borderRadius:20,
    width: 50,
    height:50,
  },
  nameartist:{
    marginTop:8,
    marginBottom:5,
    fontWeight:'bold',
  },
  followButton:{
    padding:7,
    borderWidth:1,
    borderRadius:20,
  },
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  title: {
    fontSize: 16,
    flex: 1,
  },
});

export default AllContent;
