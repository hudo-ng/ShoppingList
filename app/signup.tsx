"use client"

import { useContext, useState } from "react"
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from 'expo-router'
import { Formik } from "formik"
import * as Yup from 'yup';
import { AuthContext } from "../components/AuthContext"
import * as SecureStore from 'expo-secure-store';

interface valueSet {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export default function SignupScreen({ navigation }: { navigation: any }) {
 
  const [loading, setLoading] = useState(false)
  
  const { setToken } = useContext(AuthContext);
  
  const [serverError, setServerError] = useState('');
  
  const signUpSchema = Yup.object().shape({
    firstName: Yup.string().min(2, 'Too short!').required('First name is required'),
    lastName: Yup.string().min(2, 'Too short!').required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phoneNumber: Yup.string()
      .matches(/^\d{10,15}$/, 'Invalid phone number')
      .required('Phone number is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/[a-z]/, 'Must include a lowercase letter')
      .matches(/[A-Z]/, 'Must include an uppercase letter')
      .matches(/[0-9]/, 'Must include a number')
      .matches(/[@$!%*?&#]/, 'Must include a special character')
      .required('Password is required'),
  });

  const handleSignUp = async (values: valueSet) => {
    setLoading(true);
    setServerError('');
    try {
      const response = await fetch('http://10.0.0.141:5000/api/users/signup', {
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
        setServerError(data.msg || 'Signup failed. Please try again.');
      }
    } catch (error) {
      setServerError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const router = useRouter(); // Get the router hook

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign Up To Get Started</Text>
          </View>

          <View style={styles.container}>
            <Formik
              initialValues={{ firstName: '', lastName: '', email: '', phoneNumber: '', password: '' }}
              validationSchema={signUpSchema}
              onSubmit={(values) => handleSignUp(values)}
            >
              {({ handleChange, handleBlur, setFieldValue, handleSubmit, values, errors, touched }) => (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    onChangeText={handleChange('firstName')}
                    onBlur={handleBlur('firstName')}
                    value={values.firstName}
                  />
                  {// touched.firstName && errors.firstName && 
                  <Text style={styles.error}>{errors.firstName}</Text>}
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    onChangeText={handleChange('lastName')}
                    onBlur={handleBlur('lastName')}
                    value={values.lastName}
                  />
                  {// touched.lastName && errors.lastName && 
                  <Text style={styles.error}>{errors.lastName}</Text>}
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    keyboardType="email-address"
                    onChangeText={(e) => { setFieldValue('email', e.toLowerCase()); handleChange('email'); }}
                    onBlur={handleBlur('email')}
                    value={values.email}
                  />
                  {// touched.email && errors.email && 
                  <Text style={styles.error}>{errors.email}</Text>}
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                    onChangeText={handleChange('phoneNumber')}
                    onBlur={handleBlur('phoneNumber')}
                    value={values.phoneNumber}
                  />
                  { //touched.phoneNumber && errors.phoneNumber && 
                  <Text style={styles.error}>{errors.phoneNumber}</Text>}
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                  />
                  {// touched.password && errors.password && 
                  <Text style={styles.error}>{errors.password}</Text>}
                  
                  {serverError ? <Text style={styles.error}>{serverError}</Text> : null}
                  
                  <TouchableOpacity style={styles.button} onPress={() => handleSubmit()} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
                  </TouchableOpacity>
                </>
              )}
            </Formik>
            <View style={ { flexDirection: 'row', marginTop: 20, marginBottom: 100 } }>
              <Text style={ { fontSize: 18, textAlign: "center", paddingHorizontal: 5, } }>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/signin')}>
                <Text style={ { fontSize: 18, textAlign: "center", paddingHorizontal: 5, fontWeight: "bold",textDecorationLine: 'underline' } }>Sign In</Text>  
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#90EE90",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: "center",
  },
  icon: {
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "black",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#2E7D32",
    textAlign: "center",
  },
  form: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
    color: "#33691E",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#F5F5F5",
  },
  inputError: {
    borderColor: "#ff3b30",
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 14,
    marginTop: 5,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 15,
  },
  button: {
    backgroundColor: "#006400",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#757575",
    fontSize: 16,
  },
  loginLink: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 5,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
})