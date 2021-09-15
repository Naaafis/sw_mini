import React, { useState, useEffect } from 'react'; //use effect does something after render 
import { Text, View, StyleSheet, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initializeApp } from "firebase/app";
import { firebase } from '@firebase/app'
import 'firebase/firestore';
import { getDatabase, ref, set } from "firebase/database";
import "firebase/database";
import "firebase/auth";
import * as Google from "expo-google-app-auth";
require('firebase/database');




//require("firebase/database");
function writeUserData(user_name, name, cals) {
  firebase.database().ref('users/'+ user_name).once("value", snapshot => {
    if (snapshot.exists())
    {
      console.log("exists"); 
      //update
       firebase
    .database()
    .ref('users/' + user_name)
    .update({
      [name]: cals,
    });
    }
    else
    {
      firebase
    .database()
    .ref('users/' + user_name)
    .set({
      [name]: cals,
    });
    }
  }); 
}

/*componentDidMount() {
    firebase.database.ref('/recipes').on('value', (snapshot) => {
      const data = snapshot.val(); 
      console.log(data.food); 
      console.log(data.calories); 
      });
}*/ 

function setUpCalsListener(user_name) {
  firebase.database().ref('users/' + user_name).on('value', (snapshot) => {
    //console.log(snapshot.val()); 
    return (snapshot.val()); 
    //const calories = snapshot.val().calories;
    //const food = snapshot.val().food;
    //console.log("Food : " + food + "has calories : " + calories);
  });
}


function HomeScreen({ route, navigation }) {
  const { user } = route.params;
  console.log("user from google", user);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Profile Screen</Text>
      <Text>Welcome {user.name} !</Text>
      <Button
        title="Go to Scanner"
        onPress={() => navigation.navigate('Scanner', {user})}
      />
       <Button
        title="Recipe information"
        onPress={() => navigation.navigate('Recipe', {user})}
      />
    </View>
  );
}


function LoginScreen({ navigation }) {
  const signInAsync = async () => {
    console.log("LoginScreen.js 6 | loggin in");
    try {
      const { type, user } = await Google.logInAsync({
        iosClientId: `340229934150-cktoflno2b7g9d8cj0fmqa2np6kjgg0t.apps.googleusercontent.com`,
        androidClientId: `<YOUR_ANDROID_CLIENT_ID>`,
      });

      if (type === "success") {
        // Then you can use the Google REST API
        console.log("LoginScreen.js 17 | success, navigating to profile");
        navigation.navigate("Home", { user });
      }
    } catch (error) {
      console.log("LoginScreen.js 19 | error with login", error);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Login with Google" onPress={signInAsync} />
    </View>
  );
}

function RecipeScreen({ route, navigation }) {
   const { user } = route.params;
   const user_name = user.name;
   const array = Object.values(setUpCalsListener(user_name)); 
  return(
  <Text> Recipes Show </Text> 
  ); 
}

function BarcodeScreen({ route, navigation }) {
  var prod_id = null;
  var current_food = null;
  var current_cals = null;
   const { user } = route.params;
   const user_name = user.name; 
  //const [prod_id, setId, getId] = useState(0); 
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const getDataFromApi = async (prod_id) => {
    try {
      let response = await fetch('https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: prod_id //{'012000171758'}
        })
      });
      let json = await response.json();
      //console.log(prod_id); 
      current_food = json.foods[0].lowercaseDescription;
      current_cals = json.foods[0].foodNutrients[3].value;
      writeUserData(user_name, current_food, current_cals); 
      //console.log(current_food + " : " + current_cals);
      // return json.foods; 
      //console.lJSON.parse(json.food); 
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    (async () => {
      //getData(); 
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    //  alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    //processing of data depending on barcode type (i.e removing a zero or not))
    //console.log(type); 

   // console.log(type);
    if (type == 'org.gs1.EAN-13') {


      
      prod_id = data.slice(1);
      // setId(parseInt(data, 10)); 
    }
    else {
  
      prod_id = data;
      // setId(data); 
    }
    //console.log(prod_id);
    getDataFromApi(prod_id);
  };


  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }


  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Barcode Screen</Text>
      <Button
        title="Go to Scanner... again"
        onPress={() => navigation.push('Scanner')}
      />
      <Button title="Go to Home" onPress={() => navigation.navigate('Home')} />
      <Button title="Go back" onPress={() => navigation.goBack()} />
      <Button
        title="Go back to first screen in stack"
        onPress={() => navigation.popToTop()}
      />

      
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
    </View>
  );
}

const Stack = createNativeStackNavigator();

function App() {
  

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Scanner" component={BarcodeScreen} />
        <Stack.Screen name="Recipe" component={RecipeScreen} />
      </Stack.Navigator>
    </NavigationContainer>

    ); 
}

const styles = StyleSheet.create({
   container: {
     flex: 1,
     flexDirection: 'column',
     alignItems: 'center',
     justifyContent: 'center',
     },
 });

export default App; 

const firebaseConfig = {
  apiKey: "AIzaSyDxiWOeQDM2zVpiOGU43gJS-Q4_eNfhlfA",
  authDomain: "calorie-scanner-325815.firebaseapp.com",
  projectId: "calorie-scanner-325815",
  storageBucket: "calorie-scanner-325815.appspot.com",
  messagingSenderId: "265418080193",
  databaseURL: "https://calorie-scanner-325815-default-rtdb.firebaseio.com",
  appId: "1:265418080193:web:deb51d7fcc6b5f5c65b940",
  measurementId: "G-0TMLMDC2C0"
};
//var app = null; 
// Initialize Firebase
/*if (!firebase.apps.length) {
   app = firebase.initializeApp(firebaseConfig);
}else {
   app = firebase.app(); // if already initialized, use that one
}*/ 

//
const app = firebase.initializeApp(firebaseConfig);


//const db = app.firestore();

/*function getData() {
  firebase
  .database()
  .ref("recipe1/")
  .on("value", snapshot => {
    const cals = snapshot.val().key;
    console.log("Calories: " + cals); 
  })
}*/ 



//const analytics = getAnalytics(app);

//const db = getFirestore(app);
// Get a reference to the database service
//  var database = firebase.database();
