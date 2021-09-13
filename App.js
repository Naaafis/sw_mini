import React, { useState, useEffect } from 'react'; //use effect does something after render 
import { Text, View, StyleSheet, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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

     // console.log('inside'); 
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
    <View style={styles.container}> 
      <Text> Hello </Text> 
      <BarCodeScanner
         onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
         style={StyleSheet.absoluteFillObject}
       />
       {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
    </View> 
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
