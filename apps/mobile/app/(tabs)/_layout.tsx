import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const TAB_COLOR = "#ff5a0d";
const INACTIVE_COLOR = "#9ca3af";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: TAB_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#f3f4f6",
          paddingBottom: 6,
          paddingTop: 4,
          height: 60,
          backgroundColor: "#ffffff",
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
        headerStyle: { backgroundColor: "#ffffff" },
        headerTintColor: "#111827",
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pets"
        options={{
          title: "Mes animaux",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "paw" : "paw-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendrier",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: "Services",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "cut" : "cut-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: "Récompenses",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "gift" : "gift-outline"} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
