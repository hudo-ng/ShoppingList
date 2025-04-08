import React, { useContext, useState } from 'react'
import { Text, StyleSheet, View, TextInput, TouchableOpacity, Image } from 'react-native'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store';
import { AuthContext } from '../components/AuthContext'

interface valueSet {
  email: string;
  password: string;
}

export default function Signin() {

  const signInSchema = Yup.object().shape({
    email: Yup.string().email("Invalid Email!").required("Email is required!"),
    password: Yup.string().required("Password is required!"),
  })

  const { setToken } = useContext(AuthContext);
  const [serverError, setServerError] = useState('');

  const handleSignIn = async (values: valueSet) => {
    try {
      const response = await fetch('http://10.0.0.141:5000/api/users/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (response.ok && data.token) {
        await SecureStore.setItemAsync('token', data.token);
        setToken(data.token);
        router.push('/');
      } else {
        console.log(data.msg || 'Sign in failed');
        setServerError(data.msg || 'Sign in failed');
      }
    } catch (error) {
      console.error('Error during sign in:', error);
      setServerError('Error during sign in:' + error)
    }
  };

  const router = useRouter(); // Get the router hook
    return (
      <View style={styles.container}>

        <Image
          style={ { position: 'absolute', top: -200, width: '100%', height: undefined, aspectRatio: 1, } }
          source={require('./../assets/login-bg.png')}
        />
        <Text style={styles.title}> Welcome to Shopping Helper</Text>
        <Text style={styles.subtitle}>Never forget an item again – let's get started!</Text>
        <Formik 
          initialValues={{email: "", password: ""}}
          validationSchema={signInSchema}
          onSubmit={(values) => {
            console.log(values);
            handleSignIn(values);
            
          }} >
            {/* the form here */}
          {({handleChange, handleBlur, setFieldValue, handleSubmit, values, errors}) => (
            <View>
              <TextInput 
                style={styles.input}
                placeholder="Email"
                // onChangeText={handleChange("email")}
                onChangeText={(e) => { setFieldValue('email', e.toLowerCase()); handleChange('email'); }}
                onBlur={handleBlur("email")}
                value={values.email}
              />
              <Text style={styles.error}>{errors.email?errors.email:' '}</Text>

              <TextInput style={styles.input}
                placeholder="Password"
                secureTextEntry
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                value={values.password}
              />
              <Text style={styles.error}>{errors.password?errors.password:' '}</Text>

              {serverError ? <Text style={styles.error}>{serverError}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={() => handleSubmit()}>
              <Text style={styles.buttonText}> Sign In </Text>
            </TouchableOpacity>
            <Text style={styles.title}> </Text>
            <View style={ { flexDirection: 'row',  } }>
              <Text style={ { fontSize: 18, textAlign: "center", paddingHorizontal: 5, } }>Don't have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={ { fontSize: 18, textAlign: "center", paddingHorizontal: 5, fontWeight: "bold",textDecorationLine: 'underline' } }>Signup</Text>  
              </TouchableOpacity>
            </View>
            </View>
          )}
        </Formik>
      </View>
    );
}
// fontWeight: "bold",

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold", 
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    // fontWeight: "bold",
    marginBottom: 30,
    paddingHorizontal: 20
  },
  input: {
    width: 280,
    height: 40,
    borderWidth: 1,
    borderColor: "#000",
    padding: 12,
    marginVertical: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  error: {
    color: "red",
    height: 14,
    fontSize: 11,
  },
  button: {
    backgroundColor: "#006400",
    paddingVertical: 12,
    paddingHorizontal: 20,      
    borderRadius: 8,
    marginVertical: 10,
    width: 280,
    alignItems: "center",
  },
  buttonText: { 
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
})
