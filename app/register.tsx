import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { useRouter } from "expo-router";

const registerSchema = Yup.object().shape({
  name: Yup.string().required("Name required"),
  email: Yup.string().email("Invalid email").required("Email required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Minimum 8 characters")
    .matches(/[A-Z]/, "Must contain an uppercase letter")
    .matches(/[a-z]/, "Must contain a lowercase letter")
    .matches(/[0-9]/, "Must contain a number")
    .matches(/[^a-zA-Z0-9]/, "Must contain a special character"),
  confirmedPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Re-enter your password"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(
      /^(\+1\s?)?(\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}$/,
      "Enter a valid phone number",
    ),
});

const initialValues = {
  name: "",
  email: "",
  password: "",
  confirmedPassword: "",
  phone: "",
};

export default function Register() {
  const router = useRouter();
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={registerSchema}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        try {
          const res = await fetch("http://10.187.148.227:3000/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: values.name,
              email: values.email,
              password: values.password,
              phone: values.phone,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            Alert.alert("Register failed");
            throw new Error(data.message || "Registration failed");
          }
          setSubmitting(false);
          resetForm();
          Alert.alert("Registration successful!");
          router.replace("/");
        } catch (error) {
          console.log(error);
          Alert.alert("Registration network error");
        }
      }}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        touched,
        errors,
        values,
      }) => (
        <View style={styles.container}>
          <Text style={styles.title}>Register</Text>
          <View style={styles.formField}>
            <TextInput
              placeholder="Name"
              style={styles.input}
              onChangeText={handleChange("name")}
              onBlur={handleBlur("name")}
              value={values.name}
            />
            {touched.name && errors.name && (
              <Text style={styles.error}>{errors.name}</Text>
            )}
          </View>
          <View style={styles.formField}>
            <TextInput
              placeholder="Email"
              style={styles.input}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              value={values.email}
              keyboardType="email-address"
            />
            {touched.email && errors.email && (
              <Text style={styles.error}>{errors.email}</Text>
            )}
          </View>
          <View style={styles.formField}>
            <TextInput
              placeholder="Password"
              style={styles.input}
              onChangeText={handleChange("password")}
              onBlur={handleBlur("password")}
              value={values.password}
            />
            {touched.password && errors.password && (
              <Text style={styles.error}>{errors.password}</Text>
            )}
          </View>
          <View style={styles.formField}>
            <TextInput
              placeholder="Re-enter password"
              style={styles.input}
              onChangeText={handleChange("confirmedPassword")}
              onBlur={handleBlur("confirmedPassword")}
              value={values.confirmedPassword}
            />
            {touched.confirmedPassword && errors.confirmedPassword && (
              <Text style={styles.error}>{errors.confirmedPassword}</Text>
            )}
          </View>
          <View style={styles.formField}>
            <TextInput
              placeholder="Phone number"
              style={styles.input}
              onChangeText={handleChange("phone")}
              onBlur={handleBlur("phone")}
              value={values.phone}
            />
            {touched.phone && errors.phone && (
              <Text style={styles.error}>{errors.phone}</Text>
            )}
          </View>

          <View style={styles.btnContainer}>
            <Pressable
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.btn,
                pressed && styles.pressedBtn,
              ]}
            >
              <Text style={styles.btnText}>Register</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/login")}
              style={({ pressed }) => [
                styles.btnSecondary,
                pressed && styles.pressedBtn,
              ]}
            >
              <Text>Log in</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Formik>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: 500,
  },

  formField: {
    alignItems: "flex-start",
    marginTop: 12,
  },

  input: {
    width: 300,
    color: "gray",
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "gray",
  },

  btnContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    width: 200,
    marginTop: 12,
  },

  btn: {
    backgroundColor: "black",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },

  btnSecondary: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    borderColor: "black",
  },

  btnText: {
    color: "white",
    fontWeight: 400,
  },

  pressedBtn: {
    opacity: 0.75,
  },

  error: {
    color: "red",
    marginTop: 6,
  },
});
