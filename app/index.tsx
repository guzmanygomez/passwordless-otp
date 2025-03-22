import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function IndexScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Welcome Home 👋</Text>
      <Button title="Go to Auth Screen" onPress={() => router.push('/authScreen')} />
    </View>
  );
}