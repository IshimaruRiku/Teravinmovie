import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  StatusBar,
  TouchableOpacity,
  FlatList,
  _View,
  Button,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import * as SecureStore from "expo-secure-store";
import NetInfo from "@react-native-community/netinfo";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [localMovies, setLocalMovies] = useState([]);
  const [refresh, setRefresh] = useState(false);

  const getAllData = () => {
    SecureStore.getItemAsync("LocalMovie")
      .then((req) => JSON.parse(req))
      .then((json) => setLocalMovies(json))
      .catch((err) => console.log(err));
  };

  const setAllData = () => {
    SecureStore.deleteItemAsync("LocalMovie");
    SecureStore.setItemAsync("LocalMovie", JSON.stringify(movies))
      .then((json) => console.log(json))
      .catch((err) => console.log(err));
    getAllData();
    setRefresh(false);
  };

  const handlefetchMovie = (movie) => {
    setMovies((value) => [...value, movie]);
  };

  const fetchData = () => {
    fetch(
      "https://api.themoviedb.org/3/discover/movie?api_key=f7b67d9afdb3c971d4419fa4cb667fbf"
    )
      .then((response) => response.json())
      .then((result) => result.results)
      .then((result) => {
        setMovies([]);
        result.map(
          (movie, index) =>
            index < 10 &&
            handlefetchMovie({
              id: movie.id,
              original_title: movie.original_title,
              release_date: movie.release_date,
            })
        );
        console.log(localMovies);
      })
      .catch((err) => console.log(err));
  };

  SplashScreen.preventAutoHideAsync()
    .then((res) =>
      setTimeout(async () => {
        await SplashScreen.hideAsync();
      }, 5000)
    )
    .catch(console.warn);

  useEffect(() => {
    NetInfo.fetch().then(
      (state) => !state.isConnected && alert("No internet connection detected")
    );
    getAllData();
    fetchData();
    if (localMovies === null || localMovies === []) setAllData();
    else if (localMovies !== movies) setRefresh(true);
    setInterval(() => {
      fetchData();
      if (localMovies !== movies) {
        setRefresh(true);
        setTimeout(() => {
          setRefresh(false);
        }, 5000);
      }
    }, 60000);
  }, []);

  function Item({ data }) {
    return (
      <TouchableOpacity style={styles.list}>
        <Text>{data.original_title}</Text>
        <Text>{data.release_date}</Text>
      </TouchableOpacity>
    );
  }

  function Notification({ onRefresh }) {
    if (onRefresh)
      return (
        <View style={styles.notif}>
          <Text>Penyimpanan lokal telah diperbaharui </Text>
          <Button title="test" onPress={setAllData}>
            Test
          </Button>
        </View>
      );
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={localMovies}
        initialNumToRender={10}
        renderItem={({ item }) => <Item data={item} />}
        keyExtractor={(item) => item.id.toString()}
      />
      <Notification onRefresh={refresh} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    alignItems: "center",
  },
  list: {
    borderBottomColor: "#000",
    borderBottomWidth: 1,
    padding: 20,
  },
  notif: {
    flexDirection: "row",
  },
});
