import React, { useState, useEffect } from 'react'; //use effect does something after render 
import { Text, View, StyleSheet, Button, TextInput } from 'react-native';
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
import NumericInput from 'react-native-numeric-input'
require('firebase/database');


function writeUserData(user_name, recipe, name, cals) {
  firebase.database().ref('users/'+ user_name).once("value", snapshot => {
    if (snapshot.exists())
    {

       firebase
    .database()
    .ref('users/' + user_name + '/' + recipe)
    .update({
      [name]: cals,
    });
    }
    else
    {
      firebase
    .database()
    .ref('users/' + user_name + '/' + recipe)
    .set({
      [name]: cals,
    });
    }
  }); 
}

const setUpCalsListener = async(user_name) => {
  
  await firebase.database().ref('users/' + user_name).on('value', (snapshot) => {
    console.log(snapshot.val()); 
   // return snapshot.val().toString();
    
  });
}

function ServingsScreen({route, navigation}) {
  const { user, servings, recipe } = route.params;
   const [size, setSize] = React.useState(1);


  return(
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      
      <Text>Serving Size Screen</Text>

      <Text>Enter the servings for this ingredients please, {user.name} ...</Text>

      <NumericInput type='up-down' onChange= {size => setSize(size)} />

      <Button
        title="Go to Scanner"
        onPress={() => navigation.navigate('Scanner', { user: user , servings: {size} , recipe: recipe.text })}
      />
    </View>
  );
}

function HomeScreen({ route, navigation }) {
  const { user } = route.params;
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Profile Screen</Text>
      <Text>Welcome {user.name} !</Text>
      <Button
        title="Go to Scanner"
        onPress={() => navigation.navigate('Scanner', {user: user, servings: 1})}
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
    try {
      const { type, user } = await Google.logInAsync({
        iosClientId: `340229934150-cktoflno2b7g9d8cj0fmqa2np6kjgg0t.apps.googleusercontent.com`,
        androidClientId: `<YOUR_ANDROID_CLIENT_ID>`,
      });

      if (type === "success") {
        // Then you can use the Google REST API
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

let recipeName = '';


function RecipeScreen({ route, navigation }) {

  //const [value, onChangeText] = React.useState('click to add recipeName')
  //const text = ''; //=this.state = {text: ''};  
  const [text, setText] = React.useState('');
//  const [messages, setMessage] = useState([]); 
  const [showrec, setshowrec] = useState(false); 


  const { user } = route.params;
  const user_name = user.name;

  return(
    <View style = {styles.screenLeft}>
      <Text> {user_name} Recipes: </Text>
      <TextInput
      style = {{height: 40,fontSize: 20}}
      label="Recipe Name"
      placeholder="Enter recipe name"
      value={text}
      onChangeText={text => setText(text)}
    />
      <Button
        title="Add Serving Size"
        onPress={() => navigation.navigate('Servings', { user: user , recipe: {text}})}
      />

      <Button
        title="Display recipes"
        onPress={() => setUpCalsListener(user_name)}
      />

  </View>
  
  ); 
}

function BarcodeScreen({ route, navigation }) {
  var prod_id = null;
  var current_food = null;
  var current_cals = null;
   const  {user, servings, recipe} = route.params;
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
     // console.log(servings); 
      current_food = json.foods[0].lowercaseDescription;
      current_cals = json.foods[0].foodNutrients[3].value * servings.size;
      writeUserData(user_name, recipe, current_food, current_cals); 
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
        <Stack.Screen name="Servings" component={ServingsScreen} />
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

  screenLeft: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
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

const app = firebase.initializeApp(firebaseConfig);


