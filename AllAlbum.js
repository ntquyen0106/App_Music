import React, {useRef, useState, useEffect } from 'react';
import { ScrollView, FlatList, TextInput, TouchableOpacity, SafeAreaView, View, Text, Image, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AllAlbum({navigation}) {
const [currentTime, setCurrentTime] = useState('');
const [trends, setTrends] = useState([]);

useEffect(() => {
  fetch('https://671a3dbbacf9aa94f6a9ccd8.mockapi.io/song')
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setTrends(data[0].trends);
      }
    })
    .catch((error) => console.error(error));
}, []);


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

  const renderAlbum = ({ item }) => (
    <TouchableOpacity>
      <View style={styles.albumItem}>
            <Image source={{ uri: item.anh }} style={styles.albumImg} />
            <View style={{
              marginLeft:10,
              marginTop:10,
            }}>
                  <Text style={styles.tenAlbum}>{item.tenAlbum}</Text>
                  <Text style={styles.tenCaSiAlbum}>Album: {item.caSi}</Text>
            </View>
        </View>
    </TouchableOpacity>
  );

return (
  <SafeAreaView style={styles.container}>
        <ScrollView style={{marginTop:15}}>
              <FlatList
                data={trends}
                renderItem={renderAlbum}
                keyExtractor={(item) => item.id.toString()}
              />
          </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  row8:{
    margin:10,
    flexDirection:'row',
  },
  albumItem: {
    width: 320,
    height: 70 ,
    marginRight: 15,
    flexDirection:'row',
  },
  tenAlbum:{
    fontWeight:'bold',
    fontSize:16,

  },
  albumImg: {
    width: 50,
    height:50,
    marginLeft:10,
    marginTop:10,
  },
  tenCaSiAlbum:{
    
  },
    chartImg: {
    width: 120,
    height:100,
  },
  moChart: {
    position:'absolute',
    justifyContent:"center",
    alignItems:'center',
  },
  chartTop: {
    marginBottom:5,
    color: 'Black',
    fontSize: 14,
    fontWeight: 'bold',
  },
  chartTuaDe: {
    color: 'Black',
    fontSize: 12,
  },
  chartItem: {
    width:170,
    height:200,
    flex: 1,
    position: 'relative',
    justifyContent:'center',
    alignItems:'center',
  },
  row7:{
    height:50,
    justifyContent:'center',
    alignItems:'center',
    flexDirection:'row',
  },
    butfoot:{
    padding:20,
    justifyContent:'center',
    alignItems:'center',
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
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
});
