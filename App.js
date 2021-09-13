import React, { useState, useEffect } from 'react'; //use effect does something after render 
import { Text, View, StyleSheet, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Button
        title="Go to Scanner"
        onPress={() => navigation.navigate('Scanner')}
      />
    </View>
  );
}

function BarcodeScreen({ navigation }) {

  var prod_id = 0;
  //const [prod_id, setId, getId] = useState(0); 
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const getDataFromApi = async (prod_id) => {
    try {
      console.log('getdata');
      let response = await fetch('https://api.nal.usda.gov/fdc/v1/foods/search?api_key=XQ1wRrZ2wrECEgeGRfbyisWLBOs52e3ClNdZAFZC', {
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
      //console.log('here and prod_id is');
      // console.log({prod_id});  
      console.log(JSON.stringify(json.foods[0].description));
      // return json.foods; 
      //console.lJSON.parse(json.food); 
    } catch (error) {
      console.log('papappapppapp')
      console.error(error);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    //  alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    //processing of data depending on barcode type (i.e removing a zero or not))
    console.log(type);
    if (type == 'org.gs1.EAN-13') {

      console.log('inside');
      prod_id = data.slice(1);
      // setId(parseInt(data, 10)); 
      // console.log(await getId());  
    }
    else {
      console.log('outside');
      prod_id = data;
      // setId(data); 
    }
    console.log(prod_id);
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

      <Text> Hello </Text>
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
  var prod_id = null; 
  var current_food = null; 
  var current_cals = null; 
  //const [prod_id, setId, getId] = useState(0); 
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const getDataFromApi = async (prod_id) => {
    try {
          let response = await  fetch('https://api.nal.usda.gov/fdc/v1/foods/search?api_key=XQ1wRrZ2wrECEgeGRfbyisWLBOs52e3ClNdZAFZC', {
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
      current_food = json.foods[0].lowercaseDescription; 
      current_cals = json.foods[0].foodNutrients[3].value; 
     // console.log(JSON.stringify(json.foods));
     // return json.foods; 
  //console.lJSON.parse(json.food); 
    } catch (error) {
    console.error(error);
    }
  };

  useEffect(() => {
     (async () => {
       const { status } = await BarCodeScanner.requestPermissionsAsync();
       setHasPermission(status === 'granted');
     })();
   }, []);

  const handleBarCodeScanned = ({ type, data }) => {
     setScanned(true);
   //  alert(`Bar code with type ${type} and data ${data} has been scanned!`);
     //processing of data depending on barcode type (i.e removing a zero or not))
     //console.log(type); 
     if (type=='org.gs1.EAN-13')
     {

<<<<<<< HEAD
     // console.log('inside'); 
=======
      console.log('inside'); 
>>>>>>> 9056850db8256f2e9c8c666656ea5a83c603a92e
      prod_id = data.slice(1); 
     // setId(parseInt(data, 10)); 
     }
     else 
     {
      console.log('outside'); 
      prod_id = data; 
     // setId(data); 
     }
     getDataFromApi(prod_id); 
   };


   if (hasPermission === null) {
     return <Text>Requesting for camera permission</Text>;
   }
   if (hasPermission === false) {
     return <Text>No access to camera</Text>;
   }


  return (
    // <View style={styles.container}> 
      // <Text> Hello </Text> 
      // <BarCodeScanner
      //    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      //    style={StyleSheet.absoluteFillObject}
      //  />
      //  {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
       
    // </View> 

    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Scanner" component={BarcodeScreen} />
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
